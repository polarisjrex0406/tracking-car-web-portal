import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
// import { useCatch } from '../reactHelper';

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
      padding: "15px",
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
  errorText: {
    color: "red", // Customize the color as needed
    fontSize: "0.75rem",
    marginTop: "5px",
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
    height: 50,
    transition: "all 300ms ease-in-out 0s",
    "& button": {
      margin: "5px !important",
    },
    "&:hover": {
      backgroundColor: "rgb(140, 162, 48)",
      cursor: "pointer",
    },
  },
}));

const AdditionalInputsStep = ({ vin, deviceAdditionalInfo, deviceImage }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [updatedImage, setUpdatedImage] = useState(null);
  let deviceObj = {};

  return (
    <>
      <Typography className={classes.text}>
        {" "}
        Please enter the full IMEI number on the back of your Bouncie device.
      </Typography>
      <Formik
        initialValues={{ imei: "" }}
        validate={(values) => {
          const errors = {};
          if (!values.imei) {
            errors.imei = "IMEI cannot be blank";
          }
          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          const url = "/api/devices";
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: deviceAdditionalInfo.name,
              uniqueId: values.imei,
              model: deviceAdditionalInfo.model,
              attributes: {
                year: deviceAdditionalInfo.year, // Convert to integer
                vin: vin,
                licenseNo: deviceAdditionalInfo.licenseplate,
                nickName: deviceAdditionalInfo.nickname,
                currentMileage: deviceAdditionalInfo.currentmileage,
                deviceImage: "",
              },
            }),
          })
            .then(async (response) => {
              if (response.ok) {
                const responseData = await response.json();
                deviceObj = responseData;
                setDevice(responseData);
              } else {
                throw Error(await response.text());
              }
            })
            .then(async () => {
              // Add Image
              if (deviceImage?.length > 0) {
                const response = await fetch(
                  `/api/devices/${deviceObj.id}/image`,
                  {
                    method: "POST",
                    body: deviceImage[0],
                  }
                );
                if (response.ok) {
                  // Success Code
                } else {
                  throw Error(await response.text());
                }
              }
            })
            .then(async () => {
              if (deviceImage?.length) {
                // Update Image with device Object
                deviceObj.attributes.deviceImage = deviceImage[0].name;
                const response = await fetch(`/api/devices/${deviceObj.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...deviceObj }),
                });
                if (response.ok) {
                  const responseData = await response.json();
                  navigate(`/`);
                } else {
                  throw Error(await response.text());
                }
              } else {
                navigate(`/`);
              }
            })
            .catch((error) => {
              console.error(error);
            })
            .finally(() => {
              setSubmitting(false);
            });
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className={classes.inputContainer}>
              <Field name="imei">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    placeholder="Full IMEI"
                    fullWidth
                    sx={{
                      margin: "5px",
                    }}
                    className={classes.vinInput}
                    inputProps={{
                      maxLength: 17,
                      pattern: "[0-9a-zA-Z]*",
                      // onChange: handleInputChange,
                    }}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default AdditionalInputsStep;
