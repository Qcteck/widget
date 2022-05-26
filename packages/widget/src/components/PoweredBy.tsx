import { Box, Link, Typography } from '@mui/material';
import { LiFiLogo } from './LiFiLogo';

export const PoweredBy: React.FC = () => {
  return (
    <Box
      px={3}
      pt={2}
      pb={2}
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        flex: 1,
      }}
    >
      <Link
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
        href="https://li.fi"
        target="_blank"
        underline="none"
      >
        <Typography color="text.secondary" fontSize={12} px={0.5}>
          Powered by
        </Typography>
        <LiFiLogo variant="full" style={{ height: 16, width: 42 }} />
      </Link>
    </Box>
  );
};
