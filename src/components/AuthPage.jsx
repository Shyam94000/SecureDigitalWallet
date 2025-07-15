import React, { useState, useContext } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Fixed import path

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Get the login function from context

  const modernColors = {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#06b6d4",
    dark: "#0f172a",
    light: "#f8fafc",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // In a real app, you'd send this to a backend API
    let users = JSON.parse(localStorage.getItem('users')) || [];

    if (isLogin) {
      // Login logic
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        login(user.username); // Pass username to login function
        navigate('/scan-id');
      } else {
        setError('Invalid username or password.');
      }
    } else {
      // Register logic
      const userExists = users.some(u => u.username === username);
      if (userExists) {
        setError('Username already exists. Please choose a different one.');
      } else {
        const newUser = { username, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        login(newUser.username); // Pass username to login function
        navigate('/scan-id');
        alert('Registration successful! You are now logged in.');
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)', // Adjust for AppBar height
        backgroundColor: modernColors.light,
        padding: 3,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: { xs: 3, md: 5 },
          borderRadius: '15px',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
          textAlign: 'center',
          background: 'white',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 700,
            background: modernColors.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {isLogin ? 'Login' : 'Register'}
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{
              mt: 3,
              py: 1.5,
              background: modernColors.gradient,
              color: 'white',
              fontWeight: 600,
              borderRadius: '10px',
              textTransform: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 5px 20px rgba(99, 102, 241, 0.2)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 3, color: '#64748b' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link
            component="button"
            onClick={() => setIsLogin(!isLogin)}
            sx={{
              color: modernColors.primary,
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {isLogin ? 'Register here' : 'Login here'}
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default AuthPage;