import React, { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const modernColors = {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#06b6d4",
    dark: "#0f172a",
    light: "#f8fafc",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    glassBackground: "rgba(255, 255, 255, 0.95)",
    textPrimary: "#1e293b",
    textSecondary: "#64748b",
  };

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/');
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const navigationItems = [
    { label: "Home", path: "/", icon: <HomeIcon /> },
    ...(isAuthenticated ? [
      { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    ] : []),
  ];

  const mobileDrawerContent = (
    <Box sx={{ width: 280, pt: 2 }}>
      <List>
        {navigationItems.map((item) => (
          <ListItem 
            button 
            key={item.label} 
            component={Link} 
            to={item.path}
            onClick={() => setMobileDrawerOpen(false)}
            sx={{
              borderRadius: '12px',
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
              }
            }}
          >
            <Box sx={{ mr: 2, color: modernColors.primary }}>
              {item.icon}
            </Box>
            <ListItemText 
              primary={item.label} 
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: 600,
                  color: modernColors.textPrimary
                }
              }}
            />
          </ListItem>
        ))}
        
        {/* Authentication section in mobile drawer */}
        {isAuthenticated ? (
          <>
            <Box sx={{ mx: 2, my: 2, p: 2, backgroundColor: modernColors.light, borderRadius: '12px' }}>
              <Typography variant="body2" sx={{ color: modernColors.textSecondary, mb: 1 }}>
                Signed in as
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: modernColors.textPrimary }}>
                {currentUser?.username}
              </Typography>
            </Box>
            <ListItem 
              button 
              onClick={handleLogout}
              sx={{
                borderRadius: '12px',
                mx: 1,
                my: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                }
              }}
            >
              <Box sx={{ mr: 2, color: '#ef4444' }}>
                <LogoutIcon />
              </Box>
              <ListItemText 
                primary="Logout" 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                    color: '#ef4444'
                  }
                }}
              />
            </ListItem>
          </>
        ) : (
          <ListItem 
            button 
            component={Link}
            to="/auth"
            onClick={() => setMobileDrawerOpen(false)}
            sx={{
              borderRadius: '12px',
              mx: 1,
              my: 0.5,
              backgroundColor: modernColors.primary,
              '&:hover': {
                backgroundColor: modernColors.secondary,
              }
            }}
          >
            <Box sx={{ mr: 2, color: 'white' }}>
              <PersonIcon />
            </Box>
            <ListItemText 
              primary="Login" 
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: 600,
                  color: 'white'
                }
              }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: modernColors.glassBackground,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid rgba(99, 102, 241, 0.1)`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          {/* Logo and Title */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <img
                src="/src/assets/logos/logo3.png"
                alt="Logo"
                style={{ height: "45px", marginRight: "12px" }}
              />
              <img
                src="/src/assets/logos/logo1.png"
                alt="Logo"
                style={{ height: "45px" }}
              />
            </Box>

          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: 'center', gap: 1 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: modernColors.textPrimary,
                  fontWeight: 600,
                  textTransform: "none",
                  px: 2,
                  py: 1,
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </Button>
            ))}

            {/* Authentication Button/Menu */}
            {isAuthenticated ? (
              <>
                <Button
                  onClick={handleUserMenuClick}
                  startIcon={
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      background: modernColors.gradient,
                      fontSize: '14px',
                      fontWeight: 600
                    }}>
                      {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                  }
                  sx={{
                    color: modernColors.textPrimary,
                    fontWeight: 600,
                    textTransform: "none",
                    px: 2,
                    py: 1,
                    borderRadius: '12px',
                    ml: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    },
                  }}
                >
                  Hello, {currentUser?.username}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                      border: `1px solid rgba(99, 102, 241, 0.1)`,
                      minWidth: 200,
                    }
                  }}
                >
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      }
                    }}
                  >
                    <LogoutIcon sx={{ mr: 2, color: '#ef4444' }} />
                    <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>
                      Logout
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={Link}
                to="/auth"
                startIcon={<PersonIcon />}
                sx={{
                  background: modernColors.gradient,
                  color: 'white',
                  fontWeight: 600,
                  textTransform: "none",
                  px: 3,
                  py: 1,
                  borderRadius: '12px',
                  ml: 1,
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Login
              </Button>
            )}
          </Box>

          {/* Mobile Menu Icon */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton 
              edge="end" 
              onClick={handleMobileDrawerToggle}
              sx={{
                color: modernColors.textPrimary,
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerToggle}
        PaperProps={{
          sx: {
            backgroundColor: modernColors.glassBackground,
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        {mobileDrawerContent}
      </Drawer>
    </>
  );
};

export default Header;