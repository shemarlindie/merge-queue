import {Link, Outlet, useNavigate} from "react-router-dom";
import {AppBar, Button, Menu, MenuItem, Toolbar} from "@mui/material";
import {BsCardList, BsPerson} from "react-icons/bs";
import {useAuth} from "../../auth/hooks/useAuth";
import React from "react";


export function Layout() {
  const {user, logout} = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.UIEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout().then(() => {
      navigate("/login");
    });
  };

  return (
    <div>
      <AppBar position="static" color="transparent">
        <Toolbar>
          <Button to="/" component={Link}
                  startIcon={<BsCardList size="24"/>}
                  style={{textTransform: "none"}}
                  size="large"
          >
            Merge Queue
          </Button>
          <div className="flex-grow-1"/>

          {/*{!user && (*/}
          {/*  <Button to="/login" component={Link}*/}
          {/*          style={{textTransform: 'none'}}*/}
          {/*  >Login</Button>*/}
          {/*)}*/}

          {user && (
            <div>
              <Button endIcon={<BsPerson/>}
                      style={{textTransform: "none"}}
                      size="large"
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      onClick={handleMenu}
              >
                {user?.displayName?.split(" ")[0]}
              </Button>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>

      <div>
        <Outlet/>
      </div>

      <footer className="border-top"/>
    </div>
  );
}