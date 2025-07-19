import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import re
import time
import json
import os

LOG_FILE = "errors.log"


def log_error(message):
    with open(LOG_FILE, "a") as f:
        f.write(message + "\n")


def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)


def collect_links(base_url, total_pages=2):
    links = []
    driver = setup_driver()
    for i in range(1, total_pages + 1):
        url = f"{base_url}?page={i}" if "page=" not in base_url else f"{base_url}&page={i}"
        print(f"Fetching page: {url}")
        try:
            driver.get(url)
            time.sleep(5)
            html = driver.page_source
            soup = BeautifulSoup(html, 'html.parser')
            items = soup.find_all("a", class_="Listing_categoriesBox__CiGvQ")
            for tag in items:
                href = tag.get("href")
                if href and href != "/collegeboard":
                    links.append("https://www.buddy4study.com" + href)
        except Exception as e:
            log_error(f"Failed to fetch {url}: {e}")
    driver.quit()
    return links


def extract_first_link(link_dict):
    priority = ['Original website', 'Apply online link', 'Latest scholarship link', 'Others', 'Media Link']
    for key in priority:
        if key in link_dict:
            return link_dict[key]
    return None


def classify_award(award):
    award = str(award).lower().strip()
    monetary = any(x in award for x in ['stipend', 'rs', 'inr', '₹', '$', 'usd'])
    tuition = any(x in award for x in ['tuition', 'waiver', 'fees', 'reduction'])
    non_monetary = any(x in award for x in ['accommodation', 'certificate', 'housing', 'mentorship', 'insurance'])

    if monetary and tuition:
        return 'mixed'
    if monetary and non_monetary:
        return 'mixed'
    if tuition and non_monetary:
        return 'mixed'
    if monetary:
        return 'monetary'
    if tuition:
        return 'tuition_waiver'
    if non_monetary:
        return 'non_monetary'
    return 'other'


def extract_scholarship_data(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        res = requests.get(url, headers=headers, timeout=10)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, 'html.parser')

        def get_text(selector, default="Null"):
            tag = soup.select_one(selector)
            return tag.get_text(strip=True).replace('\xa0', ' ') if tag else default

        name = get_text("h1.scholarshipHeader_mainTitle__RAoQS")
        if name == "Null":
            return None

        cards = soup.find_all("div", class_="ScholarshipDetails_eligibilityDetailsRight__B_0tU")
        details = [card.find("p").get_text(strip=True) if card.find("p") else "Null" for card in cards]
        while len(details) < 4:
            details.append("Null")
        eligibility, region, award, deadline = details[:4]

        important_links = {}
        link_tags = soup.select("article.ScholarshipDetails_studyLine__ka4X2 a")
        for tag in link_tags:
            if tag.get_text(strip=True) and tag.get("href"):
                important_links[tag.get_text(strip=True)] = tag["href"]

        contact_text = soup.select_one("#contactdetails .ScholarshipDetails_studyLine__ka4X2")
        contact_details = contact_text.get_text("\n", strip=True) if contact_text else "Null"

        email = re.search(r"[\w._%+-]+@[\w.-]+\.\w{2,}", contact_details)
        phone = re.search(r"(\+?\d[\d\s\-]{8,}\d)", contact_details)
        description = get_text("div.ScholarshipDetails_aboutProgram__6iIDA p")

        return {
            "name": name,
            "Eligibility": eligibility,
            "Region": region,
            "Deadline": deadline,
            "Award": award,
            "Description": description,
            "Email": email.group() if email else "Null",
            "Contact Number": phone.group(1).strip() if phone else "Null",
            "link": extract_first_link(important_links),
            "category": classify_award(award),
            "Links": str(important_links),
            "contactDetails": contact_details
        }
    except Exception as e:
        log_error(f"Failed to extract from {url}: {e}")
        return None


def main():
    if os.path.exists(LOG_FILE):
        os.remove(LOG_FILE)

    print("Collecting all scholarship links...")
    always_links = collect_links("https://www.buddy4study.com/open-scholarships", total_pages=2)
    live_links = collect_links("https://www.buddy4study.com/scholarships", total_pages=2)
    upcoming_links = collect_links("https://www.buddy4study.com/upcoming-scholarships", total_pages=3)

    combined = []
    for label, links in zip(["always", "live", "upcoming"], [always_links, live_links, upcoming_links]):
        print(f"Scraping {label} scholarships ({len(links)} links)...")
        data = []
        for url in links:
            item = extract_scholarship_data(url)
            if item:
                data.append(item)
        df = pd.DataFrame(data)
        df.to_csv(f"{label}_links.csv", index=False)
        print(f"✅ Saved {label}_links.csv")
        combined.extend(data)

    with open("scholarship.json", "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)
    print("🎉 All done! Data saved to scholarship.json")


if __name__ == "__main__":
    main()