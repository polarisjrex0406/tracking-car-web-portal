import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { makeStyles } from '@mui/styles';
import { useSelector } from 'react-redux';
import { useCatch } from '../reactHelper';

const useStyles = makeStyles((theme) => ({
  modalContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    borderRadius: '8px',
    width: '317px',
    height: '266px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(2),
  },
}));
const ConfirmDeleteVehicleModal = ({ onConfirmation, onCancel }) => {
  const classes = useStyles();
  const deviceId = useSelector((state) => state.devices.selectedId);
  const handleRemove = useCatch(async () => {
    const response = await fetch(`/api/devices/${deviceId}`, { method: 'DELETE' });
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
            fontWeight: 'bold',
            color: 'rgb(42, 49, 66)',
            marginBottom: '15px',
          }}
        >
          Delete Geo-Zone
        </Typography>
        <Typography variant="body1">
          This action will permanently delete this Geo-Zone 
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

export default ConfirmDeleteVehicleModal;
