import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  inputContainer: {
    position: 'relative',
    marginBottom: '0.75em',
    width: 400,
    marginLeft: '5px',
    // background: 'rgb(242, 242, 242)',
  },
  vinInput: {
    '& .css-azuxq3-MuiInputBase-root-MuiOutlinedInput-root': {
      '&:hover': {
        outline: 'none',
        backgroundColor: 'transparent', // Remove hover effect
      },
      '&:visited': {
        outline: 'none',
        backgroundColor: 'transparent', // Remove visited effect
      },
      '&:focus-visible': {
        outline: 'none', // Remove focus-visible outline
        backgroundColor: 'transparent', // Remove focus-visible effect
      },
    },
    '& input': {
      padding: '15px',
      background: 'rgb(242, 242, 242)',
      borderRadius: '0px',
      border: '2px solid rgb(242, 242, 242)',
      fontSize: '16px',
      '&:hover': {
        outline: 'none',
        backgroundColor: 'transparent', // Remove hover effect
      },
      '&:visited': {
        outline: 'none',
        backgroundColor: 'transparent', // Remove visited effect
      },
      '&:focus-visible': {
        outline: 'none', // Remove focus-visible outline
        backgroundColor: 'transparent', // Remove focus-visible effect
      },
    },
  },
  characterCount: {
    fontFamily: 'text-regular, sans-serif',
    textTransform: 'uppercase',
    position: 'absolute',
    top: '50%',
    right: '1.2em',
    cursor: 'pointer',
    fontSize: '0.75rem',
    color: theme.palette.grey[187],
    transform: 'translateY(-50%)',
  },
  text: {
    fontFamily: 'sans-serif',
    fontSize: '1.2rem',
    color: 'rgb(76, 76, 76)',
    textAlign: 'center',
    paddingBottom: '0.5em',
  },
  button: {
    position: 'relative',
    background: 'rgb(172, 198, 64)',
    border: '1px solid rgb(187, 187, 187)',
    color: 'rgb(255, 255, 255)',
    fontFamily: 'text-regular, sans-serif',
    boxSizing: 'border-box',
    cursor: 'pointer',
    borderRadius: 5,
    margin: '5px !important',
    lineHeight: '3.2em',
    whiteSpace: 'nowrap',
    fontSize: '0.9375em',
    padding: '0px 1.33333em',
    textTransform: 'uppercase',
    width: 400,
    height: 50,
    transition: 'all 300ms ease-in-out 0s',
    '& button': {
      margin: '5px !important',
    },
    '&:hover': {
      backgroundColor: 'rgb(140, 162, 48)',
      cursor: 'pointer',
    },
    '&[disabled]': {
      backgroundColor: 'rgb(187, 187, 187)', // Change button color when disabled
      cursor: 'not-allowed',
      '&:hover': {
        backgroundColor: 'rgb(150, 150, 150)', // Keep the same hover background color for disabled state
      },
    },
  },
}));

const VinStep = ({ onSubmit }) => {
  const classes = useStyles();
  const [characterCount, setCharacterCount] = useState(0);
  const maxCharacterCount = 17; // Change this to your maximum character count

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setCharacterCount(inputValue.length);
  };

  return (
    <>
      <Typography className={classes.text}>Type your VIN</Typography>
      <Formik
        initialValues={{ vin: '' }}
        onSubmit={(values) => onSubmit(values.vin)}
      >
        <Form>
          <div className={classes.inputContainer}>
            <Field name="vin">
              {({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter VIN number"
                  fullWidth
                  sx={{
                    margin: '5px',
                  }}
                  className={classes.vinInput}
                  inputProps={{
                    maxLength: maxCharacterCount,
                    pattern: '[0-9a-zA-Z]*',
                    onChange: handleInputChange,
                  }}
                />
              )}
            </Field>
            <Typography className={classes.characterCount}>
              {characterCount}
              /
              {maxCharacterCount}
            </Typography>
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
            sx={{ margin: '5px' }}
            disabled={characterCount !== maxCharacterCount}
          >
            Next
          </Button>
        </Form>
      </Formik>
    </>
  );
};

export default VinStep;
