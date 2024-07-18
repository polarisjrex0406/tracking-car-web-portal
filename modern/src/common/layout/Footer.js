import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";

const useStyles = makeStyles((theme) => ({
  footer: {
    padding: theme.spacing(1),
    textAlign: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  text: {
    fontWeight: 500,
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  link: {
    color: "gray",
    textDecoration: "underline",
  },
}));

export default function Footer() {
  const classes = useStyles();

  return (
    <Box className={classes.footer}>
      <Typography variant="body1" className={classes.text}>
        &copy; 2024 Movo &bull; All Rights are reserved.
      </Typography>
    </Box>
  );
}
