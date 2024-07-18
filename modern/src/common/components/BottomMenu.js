import React from 'react';
// import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Paper, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { makeStyles } from '@mui/styles';
import { useDeviceReadonly } from '../util/permissions';
// import { useTranslation } from './LocalizationProvider';
import { useLocalization, useTranslation } from '../components/LocalizationProvider';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    width: '270px',
  },
  addVehicleBox: {
    height: '53px',
    background: 'rgb(42, 49, 65)',
    color: 'rgb(255, 255, 255)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addVehicleBtn: {
    color: 'rgb(255, 255, 255)',
    textTransform: 'capitalize',
    fontSize: '16px',
  },
}));

const BottomMenu = () => {
  const classes = useStyles();
  const deviceReadonly = useDeviceReadonly();
  const navigate = useNavigate();
  const t = useTranslation();
  // const devices = useSelector((state) => state.devices.items);
  return (
    <Paper square elevation={3} className={classes.addVehicleBox}>
      <AddIcon />
      <Button name="myIconButton" onClick={() => navigate('/add-vehicle')} disabled={deviceReadonly} className={classes.addVehicleBtn}>
        {/* <IconButton edge="end" name="myIconButton"> */}
        {/* <Tooltip open={!deviceReadonly && Object.keys(devices).length === 0} title={t('deviceRegisterFirst')} arrow> */}
        {/* </Tooltip> */}
        {/* </IconButton> */}
        {t('addDevice')}
      </Button>
    </Paper>
  );
};

export default BottomMenu;
