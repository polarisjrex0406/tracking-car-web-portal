import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import TextField from "@mui/material/TextField";

import {
    Divider,
    Typography,
    IconButton,
    useMediaQuery,
    Toolbar,
    Box,
    Button,
    Slider,
    Switch,
  } from "@mui/material";
  import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const useStyles = makeStyles((theme) => ({
    container: {

    },
    innerContainer: {
        padding: '15px'
    }
}));

const AddGeoZone = (toggleWindow) => {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <div className={classes.container}>
        <Toolbar
          sx={{
            background: "rgb(255, 255, 255)",
            marginBottom: "16px",
            }}
        >
            <Button
              edge="start"
              onClick={() => toggleWindow(false)}
            >
            <Typography variant="h6" className={classes.title}>
            Cancel
            </Typography>
            </Button>
        </Toolbar>
        <Box className={classes.innerContainer}>
        <Typography className={classes.heading}>
            Geo Zone
        </Typography>
        <div>
        <TextField
          className={classes.customTextField}
          label="Engine"
          name="engine"
          value=""
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
            }}
        />
        </div>
        </Box>
        <Divider />
        <Box>

        </Box>
    </div>
  );
};

export default AddGeoZone;

// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import {
//   Divider, Typography, IconButton, useMediaQuery, Toolbar,
// } from '@mui/material';
// import makeStyles from '@mui/styles/makeStyles';
// import { useTheme } from '@mui/material/styles';
// import Drawer from '@mui/material/Drawer';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import UploadFileIcon from '@mui/icons-material/UploadFile';
// import { useNavigate } from 'react-router-dom';
// import MapView from '../../../map/core/MapView';
// import MapCurrentLocation from '../../../map/MapCurrentLocation';
// import MapGeofenceEdit from '../../../map/draw/MapGeofenceEdit';
// import GeofencesList from '../../../other/GeofencesList';
// import { useTranslation } from '../../../common/components/LocalizationProvider';
// import MapGeocoder from '../../../map/geocoder/MapGeocoder';
// import { errorsActions } from '../../../store';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     height: '100%',
//     display: 'flex',
//     flexDirection: 'column',
//   },
//   content: {
//     flexGrow: 1,
//     overflow: 'hidden',
//     display: 'flex',
//     flexDirection: 'row',
//     [theme.breakpoints.down('sm')]: {
//       flexDirection: 'column-reverse',
//     },
//   },
//   drawer: {
//     zIndex: 1,
//   },
//   drawerPaper: {
//     position: 'relative',
//     [theme.breakpoints.up('sm')]: {
//       width: theme.dimensions.drawerWidthTablet,
//     },
//     [theme.breakpoints.down('sm')]: {
//       height: theme.dimensions.drawerHeightPhone,
//     },
//   },
//   mapContainer: {
//     flexGrow: 1,
//   },
//   title: {
//     flexGrow: 1,
//   },
//   fileInput: {
//     display: 'none',
//   },
// }));

// const AddGeoZone = () => {
//   const theme = useTheme();
//   const classes = useStyles();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const t = useTranslation();

//   const isPhone = useMediaQuery(theme.breakpoints.down('sm'));

//   const [selectedGeofenceId, setSelectedGeofenceId] = useState();

//   const handleFile = (event) => {
//     const files = Array.from(event.target.files);
//     const [file] = files;
//     const reader = new FileReader();
//     reader.onload = async () => {
//       const xml = new DOMParser().parseFromString(reader.result, 'text/xml');
//       const segment = xml.getElementsByTagName('trkseg')[0];
//       const coordinates = Array.from(segment.getElementsByTagName('trkpt'))
//         .map((point) => `${point.getAttribute('lat')} ${point.getAttribute('lon')}`)
//         .join(', ');
//       const area = `LINESTRING (${coordinates})`;
//       const newItem = { name: '', area };
//       try {
//         const response = await fetch('/api/geofences', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(newItem),
//         });
//         if (response.ok) {
//           const item = await response.json();
//           navigate(`/settings/geofence/${item.id}`);
//         } else {
//           throw Error(await response.text());
//         }
//       } catch (error) {
//         dispatch(errorsActions.push(error.message));
//       }
//     };
//     reader.onerror = (event) => {
//       dispatch(errorsActions.push(event.target.error));
//     };
//     reader.readAsText(file);
//   };

//   return (
//     <div className={classes.root}>
//       <div className={classes.content}>
//         <Drawer
//           className={classes.drawer}
//           anchor={isPhone ? 'bottom' : 'left'}
//           variant="permanent"
//           classes={{ paper: classes.drawerPaper }}
//         >
//           <Toolbar>
//             <IconButton edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
//               <ArrowBackIcon />
//             </IconButton>
//             <Typography variant="h6" className={classes.title}>{t('sharedGeofences')}</Typography>
//             <label htmlFor="upload-gpx">
//               <input accept=".gpx" id="upload-gpx" type="file" className={classes.fileInput} onChange={handleFile} />
//               <IconButton edge="end" component="span" onClick={() => {}}>
//                 <UploadFileIcon />
//               </IconButton>
//             </label>
//           </Toolbar>
//           <Divider />
//           <GeofencesList onGeofenceSelected={setSelectedGeofenceId} />
//         </Drawer>
        // <div className={classes.mapContainer}>
        //   <MapView>
        //     <MapGeofenceEdit selectedGeofenceId={selectedGeofenceId} />
        //   </MapView>
        //   <MapCurrentLocation />
        //   <MapGeocoder />
        // </div>
//       </div>
//     </div>
//   );
// };

// export default AddGeoZone;
