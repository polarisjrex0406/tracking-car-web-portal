import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { makeStyles } from "@mui/styles";
import { useSelector } from "react-redux";
import { useCatch } from "../reactHelper";

const useStyles = makeStyles((theme) => ({
  modalContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    borderRadius: "8px",
    width: "317px",
    height: "266px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    outline: "none",
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    gap: theme.spacing(2),
  },
}));
const ConfirmDeleteGeoFenceModal = ({ onConfirmation, onCancel, fenceId }) => {
  const classes = useStyles();
  const handleRemove = useCatch(async () => {
    const response = await fetch(`/api/geofences/${fenceId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      onConfirmation();
    } else {
      throw Error(await response.text());
    }
  });

  return (
    <Modal open onClose={onCancel} className={classes.modalContainer}>
      <Box className={classes.modalContent}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "rgb(42, 49, 66)",
            marginBottom: "15px",
          }}
        >
          Delete Vehicle
        </Typography>
        <Typography variant="body1">
          This action will permanently delete this vehicle and remove access to
          historical data. The device will remain active and can be installed on
          a different vehicle.
        </Typography>
        <div className={classes.buttonContainer}>
          <Button onClick={onCancel} variant="outlined" color="primary">
            KEEP
          </Button>
          <Button onClick={handleRemove} variant="contained" color="primary">
            DELETE
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ConfirmDeleteGeoFenceModal;
