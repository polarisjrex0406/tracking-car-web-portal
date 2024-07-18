import React from "react";
import { useNavigate } from "react-router-dom";
import { Paper, Box } from "@mui/material";
import { makeStyles } from "@mui/styles";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { useDeviceReadonly } from "../util/permissions";

const useStyles = makeStyles(() => ({
  root: {
    height: "100%",
    width: "270px",
  },
  addVehicleBox: {
    height: "65px",
    background: "rgb(94, 107, 140)",
    color: "rgb(255, 255, 255)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0px",
    paddingTop: "4px",
  },
  addVehicleBtn: {
    color: "rgb(255, 255, 255)",
    textTransform: "capitalize",
    fontSize: "16px",
  },
  inputContainer: {
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "36px",
    color: "rgb(242, 242, 242)",
    // height: '2.5rem',
    fontFamily: "text-regular, sans-serif",
    // paddingLeft: '2.5rem',
    // margin: '0px auto',
    fontSize: "0.85rem",
    borderStyle: "hidden",
    width: "230px",
    position: "relative",
  },
}));

const HeaderMenu = ({ keyword, setKeyword }) => {
  const classes = useStyles();
  const deviceReadonly = useDeviceReadonly();
  const navigate = useNavigate();
  // const t = useTranslation();
  // const devices = useSelector((state) => state.devices.items);
  return (
    <Paper
      component="form"
      // sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
      className={classes.addVehicleBox}
    >
      <Box className={classes.inputContainer}>
        <IconButton
          type="button"
          sx={{ p: "10px", color: "rgb(242, 242, 242)" }}
          aria-label="search"
        >
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1, color: "rgb(242, 242, 242)" }}
          placeholder="Search Vehicles"
          value={keyword}
          className="searchbox-placeholder"
          onChange={(e) => setKeyword(e.target.value)}
          inputProps={{ "aria-label": "search google maps" }}
        />
      </Box>
    </Paper>
  );
};

export default HeaderMenu;
