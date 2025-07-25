import logo from '../assests/logo.svg'
import '../styles/register.css'
import { useNavigate } from 'react-router-dom';

function RegisterPage() {

  const navigate = useNavigate();

  const togglePassword = (event) => {
    const passwordInput = document.getElementById('passweord');

    if (event.target.checked) {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
  }

  const formSubmitted = async (event) => { 
    event.preventDefault();
    const form = document.getElementById('register-form');
    const formData = new FormData(form);

    // converting form data into Js object (data)

    const data = Object.fromEntries(formData.entries());
    console.log('Form submitted with data:',data);
    form.reset();

    try {

      // sends post request to backend 

      const response = await fetch('http://localhost:5000/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response );

      if (response.ok) {
        console.log('User registered successfully:');
        alert('Registration successful!');
        navigate('/login'); 
      } else {
        const error = await response.text();
        console.error('Error registering user:', error);
        alert(`Registration failed: ${error}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error, please try again later.');
    }

  }

  return (
    <>
    <div className="page-wrapper">

      <div className="register-container">

        <div className="logo">
              <img src={logo} alt="NXT Watch Logo" className="logo" />
        </div>

        <form id="register-form" onSubmit={formSubmitted}>

            <div className="form-group">
                <label htmlFor="username" className="form-label">USERNAME</label>
                <input type="text" className="form-input" id="username" name="username" placeholder="Username" required />
            </div>

            <div className="form-group">
                <label htmlFor="email" className="form-label">EMAIL</label>
                <input type="email" className="form-input" id="email" name="email" placeholder="Email" required />
            </div>

            <div className="form-group">
                <label htmlFor="password" className="form-label">PASSWORD</label>
                <input type="password" id="passweord" className="form-input" name="password" placeholder="Password" required />
            </div>

            <div className="checkbox-container">
                <input type="checkbox" className="checkbox" id="showpassword" onChange={togglePassword} />
                <label htmlFor="showpassword" className="checkbox-label">Show Password</label>
            </div>

            <button type="Submit" className="register-button" onClick={navigate('/login')}>Register</button>

        </form>
      </div>

      <div className="register-footer">
        <p>Already have an account? <a href="/login">Login</a></p>
      </div>

    </div>
    </>
  )
}

export default RegisterPage;