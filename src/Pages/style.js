import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    wrapper: {
      textAlign: 'center',
      padding: theme.spacing(4),
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'left',
    },
    input: {
      marginBottom: theme.spacing(2),
    },
    button: {
      marginBottom: theme.spacing(2),
    },
  
  }));
export default useStyles;