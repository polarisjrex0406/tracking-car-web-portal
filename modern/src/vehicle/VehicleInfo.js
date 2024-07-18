import React from "react";
import { Formik, Form, Field } from "formik";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { DropzoneArea } from "react-mui-dropzone";
import { useCatch } from "../reactHelper";
import { useTranslation } from "../common/components/LocalizationProvider";

const useStyles = makeStyles(() => ({
  inputContainer: {
    position: "relative",
    marginBottom: "0.75em",
    marginLeft: "5px",
    width: 400,
  },
  vinInput: {
    "& .css-azuxq3-MuiInputBase-root-MuiOutlinedInput-root": {
      "&:hover": {
        outline: "none",
        backgroundColor: "transparent", // Remove hover effect
      },
      "&:visited": {
        outline: "none",
        backgroundColor: "transparent", // Remove visited effect
      },
      "&:focus-visible": {
        outline: "none", // Remove focus-visible outline
        backgroundColor: "transparent", // Remove focus-visible effect
      },
    },
    "& input": {
      padding: "7px",
      background: "rgb(242, 242, 242)",
      borderRadius: "0px",
      border: "2px solid rgb(242, 242, 242)",
      fontSize: "16px",
      "&:hover": {
        outline: "none",
        backgroundColor: "transparent", // Remove hover effect
      },
      "&:visited": {
        outline: "none",
        backgroundColor: "transparent", // Remove visited effect
      },
      "&:focus-visible": {
        outline: "none", // Remove focus-visible outline
        backgroundColor: "transparent", // Remove focus-visible effect
      },
    },
  },
  text: {
    fontFamily: "sans-serif",
    fontSize: "1.2rem",
    color: "rgb(76, 76, 76)",
    textAlign: "center",
    paddingBottom: "0.5em",
    width: 400,
  },
  button: {
    position: "relative",
    background: "rgb(172, 198, 64)",
    border: "1px solid rgb(187, 187, 187)",
    color: "rgb(255, 255, 255)",
    fontFamily: "text-regular, sans-serif",
    boxSizing: "border-box",
    cursor: "pointer",
    borderRadius: 5,
    margin: "5px !important",
    lineHeight: "3.2em",
    whiteSpace: "nowrap",
    fontSize: "0.9375em",
    padding: "0px 1.33333em",
    textTransform: "uppercase",
    width: 400,
    height: 40,
    transition: "all 300ms ease-in-out 0s",
    "& button": {
      margin: "5px !important",
    },
    "&:hover": {
      backgroundColor: "rgb(140, 162, 48)",
      cursor: "pointer",
    },
  },
  image: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "15px",
  },
}));

const VehicleInfo = ({ onSubmit, deviceImage }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const handleFiles = useCatch(async (files) => {
    if (files.length > 0) {
      deviceImage(files);
      // const response = await fetch(`/api/devices/${item.id}/image`, {
      //   method: "POST",
      //   body: files[0],
      // });
      // if (response.ok) {
      // deviceImage({
      //   ...item,
      //   attributes: {
      //     ...item.attributes,
      //     deviceImage: await response.text(),
      //   },
      // });
      // } else {
      //   throw Error(await response.text());
      // }
    }
  });

  return (
    <>
      <Typography className={classes.text}>
        Enter the make, model, and year of your vehicle
      </Typography>
      <Formik
        initialValues={{ name: "", model: "", year: "" }}
        validate={(values) => {
          const errors = {};
          if (!values.name) {
            errors.name = "Name cannot be blank";
          }
          if (!values.model) {
            errors.model = "Model cannot be blank";
          }
          if (!values.year) {
            errors.year = "Year cannot be blank";
          }
          return errors;
        }}
        onSubmit={(values) => onSubmit(values)}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="image-upload-custom">
              <DropzoneArea
                dropzoneText=""
                acceptedFiles={["image/*"]}
                filesLimit={1}
                onChange={handleFiles}
                showAlerts={false}
              />
            </div>
            <div className={classes.inputContainer}>
              <Field name="name">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    placeholder="Name"
                    fullWidth
                    className={classes.vinInput}
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                  />
                )}
              </Field>
            </div>
            <div className={classes.inputContainer}>
              <Field name="model">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    //   label="Model"
                    placeholder="Model"
                    fullWidth
                    //   variant="outlined"
                    className={classes.vinInput}
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                  />
                )}
              </Field>
            </div>
            <div className={classes.inputContainer}>
              <Field name="year">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    //   label="Year"
                    placeholder="Year"
                    fullWidth
                    //   variant="outlined"
                    className={classes.vinInput}
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                  />
                )}
              </Field>
            </div>
            <div className={classes.inputContainer}>
              <Field name="nickname">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    placeholder="Nick Name"
                    fullWidth
                    className={classes.vinInput}
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                  />
                )}
              </Field>
            </div>
            <div className={classes.inputContainer}>
              <Field name="licenseplate">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    placeholder="License Plate"
                    fullWidth
                    className={classes.vinInput}
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                  />
                )}
              </Field>
            </div>
            <div className={classes.inputContainer}>
              <Field name="currentmileage">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    placeholder="Current Mileage"
                    fullWidth
                    className={classes.vinInput}
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                  />
                )}
              </Field>
            </div>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
              sx={{ margin: "5px" }}
              disabled={isSubmitting}
            >
              Next
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default VehicleInfo;
