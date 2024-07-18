import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { makeStyles } from '@mui/styles';

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
const ConfirmVinModal = ({ vin, onConfirmation, onCancel }) => {
  const classes = useStyles();

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
          Please verify
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            color: 'rgb(42, 49, 66)',
            marginBottom: '15px',
          }}
        >
          {vin}
        </Typography>
        <Typography variant="body1">
          Before continuing, make certain the VIN has been entered properly.
        </Typography>
        <div className={classes.buttonContainer}>
          <Button onClick={onCancel} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button onClick={onConfirmation} variant="contained" color="primary">
            Continue
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ConfirmVinModal;
