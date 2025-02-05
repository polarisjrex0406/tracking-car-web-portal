import React from 'react';
import { useNavigate } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import {
  Container, Button, Accordion, AccordionDetails, AccordionSummary, Skeleton, Typography, TextField,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useCatch } from '../../reactHelper';
import { useTranslation } from '../../common/components/LocalizationProvider';
// import PageLayout from '../../common/components/PageLayout';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
  },
  buttons: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-evenly',
    '& > *': {
      flexBasis: '33%',
    },
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

const EditCurrentItemView = ({
  children,
  endpoint,
  item,
  // setItem,
  // defaultItem,
  validate,
  onItemSaved,
  // menu,
  // breadcrumbs,
}) => {
  const navigate = useNavigate();
  const classes = useStyles();
  const t = useTranslation();
  const currentUser = useSelector((state) => state.session.user);
  // const { id } = useParams();
  // const { id } = currentUser;
  // useEffectAsync(async () => {
  //   if (!item) {
  //     if (currentUser?.id) {
  //       const response = await fetch(`/api/${endpoint}/${currentUser?.id}`);
  //       if (response.ok) {
  //         setItem(await response.json());
  //       } else {
  //         throw Error(await response.text());
  //       }
  //     } else {
  //       setItem(defaultItem || {});
  //     }
  //   }
  // }, [currentUser?.id, item, defaultItem]);

  const handleSave = useCatch(async () => {
    let url = `/api/${endpoint}`;
    if (currentUser?.id) {
      url += `/${currentUser?.id}`;
    }

    const response = await fetch(url, {
      method: !currentUser?.id ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    if (response.ok) {
      if (onItemSaved) {
        onItemSaved(await response.json());
      }
      navigate(-1);
    } else {
      throw Error(await response.text());
    }
  });

  return (
    <Container maxWidth="xs" className={classes.container}>
      {item ? (
        children
      ) : (
        <Accordion defaultExpanded>
          <AccordionSummary>
            <Typography variant="subtitle1">
              <Skeleton width="10em" />
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={-i} width="100%">
                <TextField />
              </Skeleton>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
      <div className={classes.buttons}>
        <Button
          type="button"
          color="primary"
          variant="outlined"
          onClick={() => navigate(-1)}
          disabled={!item}
        >
          {t('sharedCancel')}
        </Button>
        <Button
          type="button"
          color="primary"
          variant="contained"
          onClick={handleSave}
          disabled={!item || !validate()}
        >
          {t('sharedSave')}
        </Button>
      </div>
    </Container>
  );
};

export default EditCurrentItemView;
