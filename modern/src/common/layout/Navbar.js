import * as React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  Tooltip,
  MenuItem,
  Container,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// import AdbIcon from '@mui/icons-material/Adb';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LanguageIcon from "@mui/icons-material/Language";
import { sessionActions } from "../../store";
import { nativePostMessage } from "../components/NativeInterface";
import { useAdministrator } from "../util/permissions";
import {
  useLocalization,
  useTranslation,
} from "../components/LocalizationProvider";

const useStyles = makeStyles({
  menuItemRoot: {
    "&:hover": {
      backgroundColor: "rgb(31, 105, 242)",
      boxShadow: "rgba(0, 0, 0, 0.12) 0px 0px 4px 0px",
      color: "white !important",
    },
    display: "flex",
    justifyContent: "space-between",
    margin: "10px 0px",
  },
});

// const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];
function Navbar() {
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElLang, setAnchorElLang] = React.useState(null);
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.session.user);
  const filteredDevices = useSelector((state) => state.devices.items);
  const filtered = Object.values(filteredDevices);
  const admin = useAdministrator();
  const { languages, language, setLanguage } = useLocalization();
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenLangMenu = (event) => {
    setAnchorElLang(event.currentTarget);
  };
  const handleCloseLangMenu = () => {
    setAnchorElLang(null);
  };

  const openProfile = () => {
    navigate("/account");
  };
  const handleLogout = async () => {
    const notificationToken = window.localStorage.getItem("notificationToken");
    if (notificationToken && !currentUser.readonly) {
      window.localStorage.removeItem("notificationToken");
      const tokens =
        currentUser.attributes.notificationTokens?.split(",") || [];
      if (tokens.includes(notificationToken)) {
        const updatedUser = {
          ...currentUser,
          attributes: {
            ...currentUser.attributes,
            notificationTokens:
              tokens.length > 1
                ? tokens.filter((it) => it !== notificationToken).join(",")
                : undefined,
          },
        };
        await fetch(`/api/users/${currentUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        });
      }
    }
    await fetch("/api/session", { method: "DELETE" });
    localStorage.removeItem("selected_trip")
    localStorage.removeItem("selected_trip_index")
    localStorage.removeItem("currentDeviceId")
    localStorage.removeItem("geofencepage")
    localStorage.removeItem('activeTab')
    nativePostMessage("logout");
    navigate("/login");
    dispatch(sessionActions.updateUser(null));
  };

  const navigateToHome = () => {
    localStorage.removeItem("selected_trip")
    localStorage.removeItem("selected_trip_index")
    localStorage.removeItem("currentDeviceId")
    localStorage.removeItem("geofencepage")
    localStorage.removeItem('activeTab')
    navigate("/");
    navigate(0);
  }

  return (
    <AppBar
      position="relative"
      sx={{ zIndex: 5, background: "rgb(42, 49, 65)" }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h4"
            noWrap
            component="a"
            onClick={navigateToHome}
            sx={{
              flexGrow: 1,  
              fontFamily: "text-bold, sans-serif",
              fontWeight: 700,
              //   letterSpacing: '.3rem',
              color: "inherit",
              textDecoration: "none",
              textAlign: "center",
              textTransform: "uppercase",
              cursor: "pointer"
            }}
          >
            {/* Put your SVG logo here */}
            {/* <AdbIcon sx={{ mr: 1 }} /> */}
            movo
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "center", marginRight: "10px" }}
          >
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <AccountCircleIcon sx={{ fontSize: "40px", fill: "white" }} />
                {/* <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" /> */}
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px", position: "absolute", marginRight: "0px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {/* <MenuItem
                onClick={openProfile}
                classes={{ root: classes.menuItemRoot }}
              >
                <Typography textAlign="center">Account</Typography>
                <Typography
                  textAlign="center"
                  sx={{
                    color: "rgb(173, 173, 173)",
                    marginLeft: "10px",
                    fontSize: "12px",
                  }}
                >
                  {currentUser?.name}
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={handleCloseUserMenu}
                classes={{ root: classes.menuItemRoot }}
              >
                <Typography textAlign="center">Device</Typography>
                <Typography
                  textAlign="center"
                  sx={{
                    color: "rgb(173, 173, 173)",
                    fontSize: "12px",
                    marginLeft: "10px",
                  }}
                >
                  {`${filtered?.length} Vehicles`}
                </Typography>
              </MenuItem>
              {admin && (
                <MenuItem
                  onClick={() => navigate("/reports/combined")}
                  classes={{ root: classes.menuItemRoot }}
                >
                  <Typography textAlign="center">Reports</Typography>
                </MenuItem>
              )}
              {admin && (
                <MenuItem
                  onClick={() => navigate("/settings/preferences")}
                  classes={{ root: classes.menuItemRoot }}
                >
                  <Typography textAlign="center">Settings</Typography>
                </MenuItem>
              )} */}
              <MenuItem
                onClick={handleLogout}
                classes={{ root: classes.menuItemRoot }}
              >
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
          <Box
            sx={{ display: "flex", alignItems: "center", marginRight: "10px" }}
          >
            <Tooltip title="Change Language">
              <IconButton onClick={handleOpenLangMenu} sx={{ p: 0 }}>
                <LanguageIcon sx={{ fontSize: "40px", fill: "white" }} />
                <img
                  style={{ position: "absolute", height: "30px", zIndex: "9" }}
                  src={`/${language}.png`}
                  alt=""
                ></img>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px", position: "absolute", marginRight: "0px" }}
              id="menu-appbar"
              anchorEl={anchorElLang}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElLang)}
              onClose={handleCloseLangMenu}
            >
              <MenuItem
                onClick={() => setLanguage("en")}
                classes={{ root: classes.menuItemRoot }}
                style={{ justifyContent: "start" }}
              >
                <img
                  src="/en.png"
                  height="30"
                  width="26"
                  style={{ objectFit: "contain" }}
                  alt="english"
                ></img>
                <Typography sx={{ paddingLeft: "10px" }} textAlign="center">
                  English
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={() => setLanguage("fr")}
                classes={{ root: classes.menuItemRoot }}
              >
                <img
                  src="/fr.png"
                  height="26"
                  width="26"
                  style={{ objectFit: "contain" }}
                  alt="french"
                ></img>
                <Typography sx={{ paddingLeft: "10px" }} textAlign="center">
                  Français
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
