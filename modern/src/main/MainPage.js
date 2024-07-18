/* eslint-disable no-unused-vars */

import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
// import { Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSelector } from 'react-redux';
import DeviceList from './DeviceList';
import BottomMenu from '../common/components/BottomMenu';
// import StatusCard from '../common/components/StatusCard';
// import { devicesActions } from '../store';
import usePersistedState from '../common/util/usePersistedState';
import EventsDrawer from './EventsDrawer';
import useFilter from './useFilter';
import MainMap from './MainMap';
// import GoogleMapComponent from '../google-map/MainMap';
// import { useAttributePreference } from '../common/util/preferences';

const useStyles = makeStyles((theme) /* eslint-disable */ => ({
  root: {
    height: '100%',
  },
  sidebar: {
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100%',
      width: theme.dimensions.drawerWidthDesktop,
      margin: 0,
      zIndex: 3,
    },
    [theme.breakpoints.down('md')]: {
      height: '100%',
      width: '100%',
    },
  },
  header: {
    pointerEvents: 'auto',
    zIndex: 6,
  },
  footer: {
    pointerEvents: 'auto',
    zIndex: 5,
  },
  middle: {
    flex: 1,
    display: 'grid',
  },
  contentMap: {
    pointerEvents: 'auto',
    gridArea: '1 / 1',
  },
  contentList: {
    pointerEvents: 'auto',
    gridArea: '1 / 1',
    zIndex: 4,
    background: 'rgb(94, 107, 140)',
  },
}));

const MainPage = () => {
  const classes = useStyles();
  // const dispatch = useDispatch();
  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  // const mapOnSelect = useAttributePreference('mapOnSelect', true);
  const filterDevice = useSelector((state) => state.devices.items);
  const devicesList = Object.values(filterDevice)
  const filterDeviceId =devicesList.length > 0 ? devicesList[0].id : null
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  
  const positions = useSelector((state) => state.session.positions);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectedPosition = filteredPositions.find((position) => selectedDeviceId && position.deviceId === filterDeviceId);
  const [filteredDevices, setFilteredDevices] = useState([]);

  const [keyword] = useState('');
  const [filter] = usePersistedState('filter', {
    statuses: [],
    groups: [],
  });
  const [filterSort] = usePersistedState('filterSort', '');
  const [filterMap] = usePersistedState('filterMap', false);

  const [eventsOpen, setEventsOpen] = useState(false);

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);

  // useEffect(() => {
  //   if (!desktop && mapOnSelect && selectedDeviceId) {
  //     setDevicesOpen(false);
  //   }
  // }, [desktop, mapOnSelect, selectedDeviceId]);

  useFilter(keyword, filter, filterSort, filterMap, positions, setFilteredDevices, setFilteredPositions);
  
  return (
    <div className={classes.root}>
      {desktop && (
        <MainMap
          filteredPositions={filteredPositions}
          selectedPosition={selectedPosition}
          onEventsClick={onEventsClick}
        />
      )}
      {/* <div className={classes.sidebar}>
        <div className={classes.middle}>
          {!desktop && (
            <div className={classes.contentMap}>
              <MainMap
                filteredPositions={filteredPositions}
                selectedPosition={selectedPosition}
                onEventsClick={onEventsClick}
              />
            </div>
          )}
          <Paper square className={classes.contentList}>
            <DeviceList devices={filteredDevices} />
          </Paper>
        </div>
        {desktop && (
          <div className={classes.footer}>
            <BottomMenu />
          </div>
        )}
      </div> */}
      {/* <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} /> */}
      {/* <Outlet /> */}
      {/* {selectedDeviceId && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={selectedPosition}
          onClose={() => dispatch(devicesActions.selectId(null))}
          desktopPadding={theme.dimensions.drawerWidthDesktop}
        />
      )} */}
    </div>
  );
};

export default MainPage;
