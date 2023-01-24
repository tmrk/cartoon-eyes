import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { CssBaseline, Container, List, ListItem, Paper, ButtonGroup, Button, Typography, Box } from '@mui/material';
import { useState } from 'react';
import { Eye } from './components/CartoonEyes'
import { InputSlider } from './InputSlider';
import { MuiColorInput } from 'mui-color-input'

function App() {

  const original = {
    upperLidSize: 20,
    lowerLidSize: 20,
    scleraWidth: 70,
    scleraHeight: 50,
    irisWidth:  80,
    irisHeight: 80,
    pupilWidth: 30, 
    pupilHeight: 30,
    scleraColor: '#ffffff',
    irisColor: '#0000ff',
    pupilColor: '#000000',
    upperLidColor: '#aaaaaa',
    lowerLidColor: '#aaaaaa'
  };

  const [upperLidSize, setUpperLidSize] = useState(original.upperLidSize);
  const [lowerLidSize, setLowerLidSize] = useState(original.lowerLidSize);
  const [scleraWidth, setScleraWidth] = useState(original.scleraWidth);
  const [scleraHeight, setScleraHeight] = useState(original.scleraHeight);
  const [irisWidth, setIrisWidth] = useState(original.irisWidth);
  const [irisHeight, setIrisHeight] = useState(original.irisHeight);
  const [pupilWidth, setPupilWidth] = useState(original.pupilWidth);
  const [pupilHeight, setPupilHeight] = useState(original.pupilHeight);
  const [scleraColor, setScleraColor] = useState(original.scleraColor);
  const [irisColor, setIrisColor] = useState(original.irisColor);
  const [pupilColor, setPupilColor] = useState(original.pupilColor);
  const [upperLidColor, setUpperLidColor] = useState(original.upperLidColor);
  const [lowerLidColor, setLowerLidColor] = useState(original.lowerLidColor);

  const preset = (setting) => {
    switch (setting) {
      case 'default':
        preset([ original.scleraWidth, original.scleraHeight, original.irisWidth, original.irisHeight, 
          original.pupilWidth, original.pupilHeight, original.upperLidSize, original.lowerLidSize, 
          original.scleraColor, original.irisColor, original.pupilColor, original.upperLidColor, 
          original.lowerLidColor ]);
        break;
      case 'snake':
        preset([80, 70, 100, 100, 10, 80, 0, 0, '#aaffaa', '#ff7700', '#000000']);
        break;
      case 'zombie': 
        preset([80, 65, 70, 65, 50, 50, 35, 20, '#ffffdd', '#559933', '#330000', '#557755', '#557755']);
        break;
      default:
        if (Array.isArray(setting)) {
          setScleraWidth(setting[0]);
          setScleraHeight(setting[1]);
          setIrisWidth(setting[2]);
          setIrisHeight(setting[3]);
          setPupilWidth(setting[4]);
          setPupilHeight(setting[5]);
          setUpperLidSize(setting[6]);
          setLowerLidSize(setting[7]);
          setScleraColor(setting[8]);
          setIrisColor(setting[9]);
          setPupilColor(setting[10]);
          setUpperLidColor(setting[11])
          setLowerLidColor(setting[12]);
        }
        break;
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth={false} sx={{bgcolor: '#eee'}}>
        <Grid container columns={2} spacing={2} wrap='nowrap'>
          <Grid xs={1}>
            <Eye 
              scleraWidth={scleraWidth} 
              scleraHeight={scleraHeight} 
              upperLidSize={upperLidSize} 
              lowerLidSize={lowerLidSize} 
              irisWidth={irisWidth} 
              irisHeight={irisHeight} 
              pupilWidth={pupilWidth} 
              pupilHeight={pupilHeight}
              scleraColor={scleraColor}
              irisColor={irisColor}
              pupilColor={pupilColor}
              upperLidColor={upperLidColor}
              lowerLidColor={lowerLidColor}
              blinking={3} 
            />
          </Grid>
          <Grid container justifyContent={'center'} alignItems={'center'} display={'flex'} flex={1} flexDirection={'column'} gap={2}>
            <Paper elevation={8}>
              <Grid container flexDirection={'column'}>
                <Grid display={'flex'}>
                  <Box width={130}>
                    <Typography xs={1}>Sclera</Typography>
                    <MuiColorInput format='hex' isAlphaHidden value={scleraColor} onChange={setScleraColor} />
                  </Box>
                  <Box width={130}>
                    <Typography xs={1}>Iris</Typography>
                    <MuiColorInput format='hex' isAlphaHidden value={irisColor} onChange={setIrisColor} />
                  </Box>
                  <Box width={130}>
                    <Typography xs={1}>Pupil</Typography>
                    <MuiColorInput format='hex' isAlphaHidden value={pupilColor} onChange={setPupilColor} />
                  </Box>
                  <Box width={130}>
                    <Typography xs={1}>Upper lid</Typography>
                    <MuiColorInput format='hex' isAlphaHidden value={upperLidColor} onChange={setUpperLidColor} />
                  </Box>
                  <Box width={130}>
                    <Typography xs={1}>Lower lid</Typography>
                    <MuiColorInput format='hex' isAlphaHidden value={lowerLidColor} onChange={setLowerLidColor} />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            <Paper elevation={8}>
              <Grid container columns={2}>
                <Grid xs={1}>
                  <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    <ListItem>
                      <InputSlider label='Sclera width' sx={{width: '100%'}} value={scleraWidth} setValue={setScleraWidth} />
                    </ListItem>
                    <ListItem>
                      <InputSlider label='Sclera height' sx={{width: '100%'}} value={scleraHeight} setValue={setScleraHeight} />
                    </ListItem>
                    <ListItem>
                      <InputSlider label='Upper eyelid size' sx={{width: '100%'}} value={upperLidSize} setValue={setUpperLidSize} />
                    </ListItem>
                    <ListItem>
                      <InputSlider label='Lower eyelid size' sx={{width: '100%'}} value={lowerLidSize} setValue={setLowerLidSize} />
                    </ListItem>
                  </List>
                </Grid>
                <Grid xs={1}>
                  <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    <ListItem>
                      <InputSlider label='Iris width' sx={{width: '100%'}} value={irisWidth} setValue={setIrisWidth} />
                    </ListItem>
                    <ListItem>
                      <InputSlider label='Iris height' sx={{width: '100%'}} value={irisHeight} setValue={setIrisHeight} />
                    </ListItem>
                    <ListItem>
                      <InputSlider label='Pupil width' sx={{width: '100%'}} value={pupilWidth} setValue={setPupilWidth} />
                    </ListItem>
                    <ListItem>
                      <InputSlider label='Pupil height' sx={{width: '100%'}} value={pupilHeight} setValue={setPupilHeight} />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Paper>
            <Grid><Typography xs={1}>Presets:</Typography></Grid>
            <ButtonGroup xs={1} aria-label="outlined primary button group">
              <Button onClick={() => preset('default')}>Default</Button>
              <Button onClick={() => preset('snake')}>Snake</Button>
              <Button onClick={() => preset('zombie')}>Zombie</Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}

export default App;
