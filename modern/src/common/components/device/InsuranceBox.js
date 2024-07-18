/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import { Button, IconButton } from "@mui/material";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { useSelector } from "react-redux";
import { useTranslation } from "../../components/LocalizationProvider";

const useStyles = makeStyles(() => ({
  root: {
    inset: 0,
    overflow: "auto",
    paddingBottom: "16px",
    // height: "70vh",
  },
  childBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  innerBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  image: {
    width: "60px", // Set the appropriate width
    height: "60px", // Set the appropriate height
    objectFit: "contain",
  },
  text: {
    textTransform: "uppercase",
    fontSize: "12px",
    fontFamily: "Roboto",
    marginBottom: "0",
    fontWeight: "bold",
    color: "rgb(48 48 48)",
  },
  innerText: {
    fontSize: "1.3rem",
    fontFamily: "Roboto",
    marginBottom: "0.5em",
    // fontWeight: 'bold',
    color: "rgb(48 48 48)",
    textTransform: "capitalize",
  },
  innerDetailText: {
    fontSize: "1rem",
    fontFamily: "Roboto",
    marginBottom: "0.8em",
    // fontWeight: 'bold',
    color: "rgb(48 48 48)",
  },
  headerText: {
    fontSize: "1.1em",
    fontFamily: "Roboto",
    margin: "0.8em 0.5em",
    // fontWeight: 'bold',
    color: "rgb(48 48 48)",
    fontWeight: "bold",
  },
  driverData: {
    background: "rgb(255, 255, 255)",
    borderRadius: "8px",
    padding: "0.8em 1.2em",
    boxShadow: "0px 0px 8px rgb(233, 233, 233)",
    display: "flex",
    marginBottom: "0.15em",
    fontFamily: "Roboto",
    fontSize: "0.9rem",
    flexDirection: "column",
  },
  btnBox: {
    display: "flex",
    justifyContent: "center",
    padding: "15px",
  },

  insuranceInfo: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "1.1em",
    // color: "rgb(48 48 48)",
    fontFamily: "Roboto",
    marginRight: "10px",
    flex: "0 0 auto",
    fontWeight: "bold",
    lineHeight: "40px",
  },
  boxTitleBar: {
    display: "flex",
    justifyContent: "space-between",
  },
  infoColumn: {
    display: "flex",
    width: "50%",
    flexDirection: "column",
    paddingBottom: "10px",
  },
  infoBox: {
    display: "flex",
    flexWrap: "wrap",
  },
  infoColumnTitle: {
    textTransform: "uppercase",
    fontSize: "14px",
    fontWeight: "500",
  },
  infoColumnButton: {
    cursor: "pointer",
    color: "#1F69F2",
    fontWeight: "500",
  },
  infoColumnText: {},
  customTextField: {
    width: "49%",
  },
}));

const InsuranceBox = ({ vehicleId }) => {
  const classes = useStyles();
  const t = useTranslation();
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const [editState, setEditState] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState({});
  const [formData, setFormData] = useState({
    "Insurance Provider": "",
    "Agent Name": "",
    "Policy Number": "",
    "Agent Contact": "",
    "Effective Date": "",
    "Expiration Date": "",
  });

  const [insuranceData, setInsuranceData] = useState({});
  const [saveFormLoader, setSaveFormLoader] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedAttributes = {
      ...selectedDevice.attributes,
      ...formData,
    };

    const body = {
      ...selectedDevice,
      attributes: updatedAttributes,
    };
    try {
      setSaveFormLoader(true);
      const response = await fetch(`/api/devices/${vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        setInsuranceData(result.attributes);
      } else {
        // console.error("Failed to send data to the backend");
      }
    } catch (error) {
      setSaveFormLoader(false);
      // console.error("Error sending data:", error);
    } finally {
      setSaveFormLoader(false);
      setEditState(false);
    }
  };

  const toggleEditState = () => {
    setEditState(!editState);
  };

  useEffect(() => {
    fetchDeviceData();
  }, [selectedDeviceId]);

  const fetchDeviceData = async () => {
    try {
      const response = await fetch(`/api/devices`, {
        headers: {
          Accept: "application/json",
        },
      });
      if (response.ok) {
        const result = await response.json();
        const selectedDevice = result?.filter((x) => x.id == vehicleId)[0];
        setSelectedDevice(selectedDevice);
        updateStateBasedOnObject(formData, selectedDevice.attributes);
        setInsuranceData(selectedDevice.attributes);
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      setSaveFormLoader(false);
      // console.error("Error sending data:", error);
    }
  };

  const updateStateBasedOnObject = (state, objectToUpdateWith) => {
    const updatedState = { ...state };
    for (const key in objectToUpdateWith) {
      if (
        objectToUpdateWith.hasOwnProperty(key) &&
        updatedState.hasOwnProperty(key)
      ) {
        updatedState[key] = objectToUpdateWith[key];
      }
    }
    setFormData(updatedState);
  };

  return (
    <>
      <Box className={classes.insuranceInfo}>
        <Box className={classes.boxTitleBar}>
          <Box className={classes.title}>{t("insuranceSummary")}</Box>
          {editState ? (
            <div>
              <Button
                onClick={() => toggleEditState()}
                className={classes.editButton}
              >
                {t("sharedCancel")}
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => toggleEditState()}
              className={classes.editButton}
            >
              {t("sharedEdit")}
            </Button>
          )}
        </Box>
        <Box className={classes.driverData}>
          {!editState ? (
            <Box className={classes.infoBox}>
              <Box className={classes.infoColumn}>
                <strong className={classes.infoColumnTitle}>
                  {t("insuranceProvider")}
                </strong>
                {insuranceData["Insurance Provider"] ? (
                  <span className={classes.infoColumnText}>
                    {insuranceData["Insurance Provider"]}
                  </span>
                ) : (
                  <span
                    onClick={() => toggleEditState()}
                    className={classes.infoColumnButton}
                  >
                    {t("addInsurance")}
                  </span>
                )}
              </Box>
              <Box className={classes.infoColumn}>
                <strong className={classes.infoColumnTitle}>
                  {t("agentName")}
                </strong>
                {insuranceData["Agent Name"] ? (
                  <span className={classes.infoColumnText}>
                    {insuranceData["Agent Name"]}
                  </span>
                ) : (
                  <span
                    onClick={() => toggleEditState()}
                    className={classes.infoColumnButton}
                  >
                    {t("addAgent")}
                  </span>
                )}
              </Box>
              <Box className={classes.infoColumn}>
                <strong className={classes.infoColumnTitle}>
                  {t("policyNumber")}
                </strong>
                {insuranceData["Policy Number"] ? (
                  <span className={classes.infoColumnText}>
                    {insuranceData["Policy Number"]}
                  </span>
                ) : (
                  <span
                    onClick={() => toggleEditState()}
                    className={classes.infoColumnButton}
                  >
                    {t("addPolicy")}
                  </span>
                )}
              </Box>
              <Box className={classes.infoColumn}>
                <strong className={classes.infoColumnTitle}>
                  {t("agentContact")}
                </strong>
                {insuranceData["Agent Contact"] ? (
                  <span className={classes.infoColumnText}>
                    {insuranceData["Agent Contact"]}
                  </span>
                ) : (
                  <span
                    onClick={() => toggleEditState()}
                    className={classes.infoColumnButton}
                  >
                    {t("addContact")}
                  </span>
                )}
              </Box>
              <Box className={classes.infoColumn}>
                <strong className={classes.infoColumnTitle}>
                  {t("effectiveDate")}
                </strong>
                {insuranceData["Effective Date"] ? (
                  <span className={classes.infoColumnText}>
                    {insuranceData["Effective Date"]}
                  </span>
                ) : (
                  <span
                    onClick={() => toggleEditState()}
                    className={classes.infoColumnButton}
                  >
                    {t("addDate")}
                  </span>
                )}
              </Box>
              <Box className={classes.infoColumn}>
                <strong className={classes.infoColumnTitle}>
                  {t("expirationDate")}
                </strong>
                {insuranceData["Expiration Date"] ? (
                  <span className={classes.infoColumnText}>
                    {insuranceData["Expiration Date"]}
                  </span>
                ) : (
                  <span
                    onClick={() => toggleEditState()}
                    className={classes.infoColumnButton}
                  >
                    {t("addDate")}
                  </span>
                )}
              </Box>
            </Box>
          ) : (
            <Box className={classes.infoFormBox}>
              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                <TextField
                  className={classes.customTextField}
                  label="Insurance Provider"
                  name="Insurance Provider"
                  value={formData["Insurance Provider"]}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  className={classes.customTextField}
                  label="Agent Name"
                  name="Agent Name"
                  value={formData["Agent Name"]}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  className={classes.customTextField}
                  label="Policy Number"
                  name="Policy Number"
                  value={formData["Policy Number"]}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  className={classes.customTextField}
                  label="Agent Contact"
                  name="Agent Contact"
                  value={formData["Agent Contact"]}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  className={classes.customTextField}
                  label="Effective Date"
                  name="Effective Date"
                  type="date"
                  value={formData["Effective Date"]}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  className={classes.customTextField}
                  label="Expiration Date"
                  name="Expiration Date"
                  type="date"
                  value={formData["Expiration Date"]}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <div style={{ display: "flex" }}>
                  <Button
                    style={{ marginRight: "15px" }}
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Save
                  </Button>
                  {saveFormLoader && <CircularProgress />}
                </div>
              </form>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default InsuranceBox;
