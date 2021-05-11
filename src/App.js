import React, { useContext, useEffect, useState } from 'react'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  GridList,
  GridListTile, 
  Card, 
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
} from '@material-ui/core'
import ImageUploading from 'react-images-uploading'
import firebase from './configs/firebase'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import {useHistory} from 'react-router-dom'
import {v4 as uuidv4} from 'uuid'

const BackendDataContext = React.createContext()
const BackendDataProvider = BackendDataContext.Provider

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [loginDialogMessage, setLoginDialogMessage] = useState('')
  let history = useHistory()
  const bData = useContext(BackendDataContext)

  return (
    <div style={{width: '100%', height: '100%', background: '#236ADA', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <Card style={{width: 500, height: 600, marginTop: 150, marginBottom: 180}}>
        <CardContent style={{height: '100%'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <h1 style={{height: 100}}> Login  </h1>

            <TextField label='E-mail' variant='outlined' fullWidth={true} value={email} onChange={text => setEmail(text.target.value)}></TextField>
            <div style={{height: 90}}></div>
            <TextField label='Password' type='password' variant='outlined' fullWidth={true} value={password} onChange={text => setPassword(text.target.value)}></TextField>

            <div style={{height: 90}}></div>
            <Button variant='contained' color='primary' style={{width: 250}} onClick={() => {
              console.log("Login pressed")
              firebase.auth().signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                  console.log("Login success")
                  firebase.database().ref().child('pengguna').child(userCredential.user.uid).get()
                    .then(snapshot => {
                      if(snapshot.exists()) {
                        console.log("Data get")
                        const data = snapshot.val()

                        bData.setData({...data, uid: userCredential.user.uid})
                        console.log("set bData")
                        setEmail('')
                        setPassword('')
                        
                        console.log("go to home")
                        history.push('/home')
                      }
                    })
                })
                .catch(error => {
                  setLoginDialogMessage(error.message)
                  setShowLoginDialog(true)
                })
            }}>Login</Button>
            <div style={{height: 40}}></div>
            <Button variant='contained' color='secondary' style={{width: 250}} onClick={() => {
              firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                  firebase.database().ref(`pengguna/${userCredential.user.uid}`).set({
                    email: email,
                    password: password,
                    uid: userCredential.user.uid,
                  })
                  .then(() => {
                    setEmail('')
                    setPassword('')

                    setLoginDialogMessage("Account registered successfully")
                    setShowLoginDialog(true)
                  })
                  .catch(error => {
                    setLoginDialogMessage(error.message)
                    setShowLoginDialog(true)
                  })
                })
                .catch(error => {
                  setLoginDialogMessage(error.message)
                  setShowLoginDialog(true)
                })
            }}>Register Account</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showLoginDialog}>
        <DialogTitle></DialogTitle>

        <DialogContent>
          {loginDialogMessage}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowLoginDialog(false)}>Ok</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

function MainPage() {
  const [imageData, setImageData] = useState([])
  const [imageToUpload, setImageToUpload] = useState([])
  const [imageTitle, setImageTitle] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const bData = useContext(BackendDataContext)
  let history = useHistory()

  const ambilGambarDariFirebase = () => {
    console.log(bData.data.uid)
    firebase.database().ref('images').orderByChild('penggunaUid')
      .equalTo(bData.data.uid).get()
      .then(snapshot => {
        if(snapshot.exists()) {
          let raw = snapshot.val()
          let data = []

          Object.keys(raw).map(el => data.push(raw[el]))

          setImageData(data)
        }
      })
  }

  useEffect(() => {
    if(bData.data.uid != undefined)
      ambilGambarDariFirebase()
  }, [])

  return (
  <div>
    <AppBar position='static'>
      <Toolbar>
        <div style={{display: 'flex', flexGrow: 1}}>
          <div style={{flexGrow: 1}}>
            <Typography variant='h4'>OnlinePic Gallery</Typography>
          </div>
          <Button variant='contained' style={{marginRight: 15}} onClick={() => ambilGambarDariFirebase()}>Refresh</Button>
          <Button variant='contained' style={{marginRight: 15}} onClick={() => {
            bData.setData({})
            history.push('/')
          }}>Log out</Button>
          <Button variant='contained' onClick={() => setShowDialog(true)}>Add New Image</Button>
        </div>
      </Toolbar>
    </AppBar>
    <GridList cols={3} cellHeight={650}>
      {
        imageData.map((el, idx) =>
          <GridListTile key={idx} rows={1}>
            <div style={{padding: 25, height: 500}}>
              <Card>
                <CardContent>
                  <img src={el.imgData}/>
                  <p>{el.imgTitle}</p>
                </CardContent>
              </Card>
            </div>
          </GridListTile>
        )
      }
    </GridList>
    <Dialog open={showDialog}>
      <DialogTitle>Add New Image</DialogTitle>
      <DialogContent>
        <ImageUploading   value={imageToUpload} 
                          onChange={data => {
                            let image = new Image
                            image.src = data[0].data_url
                            image.onload = () => {
                              let canvas = document.createElement('canvas')
                              let context = canvas.getContext('2d')

                              canvas.width = 480
                              canvas.height = 480

                              context.drawImage(image, 0, 0, 480, 480)
                              data[0].data_url = canvas.toDataURL()

                              setImageToUpload(data)
                            }
                          }} 
                          dataURLKey='data_url'
                          resolutionHeight={480}
                          >
          {({
            imageList,
            onImageUpload,
            onImageRemoveAll,
            onImageUpdate,
            onImageRemove,
            isDragging,
            dragProps
          }) => (
            <div>
              <Typography variant='h4'> Select the image you want to add </Typography>
              <div style={{display: 'flex', justifyContent: 'center', background: '#EAEAEA', minHeight: 300}} onClick={onImageUpload}>
                {
                  imageToUpload.length > 0 ?
                  <img style={{maxWidth: '100%'}} src={imageToUpload[0].data_url}/>
                  :
                  <div style={{alignSelf: 'center'}}>
                    <Typography>Click here to add photo</Typography>
                  </div>
                }
              </div>
              <div style={{height: 30}}></div>
              <TextField label='Enter image title' variant='outlined' fullWidth={true} value={imageTitle} onChange={text => setImageTitle(text.target.value)}></TextField>
            </div>
          )}
        </ImageUploading>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setShowDialog(false)
          setImageToUpload([])
          setImageTitle('')
        }}>Exit</Button>
        <Button onClick={() => {
          firebase.database().ref(`images/${uuidv4()}`).set({
            penggunaUid: bData.data.uid,
            imgData: imageToUpload[0].data_url,
            imgTitle: imageTitle,
          })
          .then(() => {
            setShowDialog(false)
            setImageToUpload([])
            setImageTitle('')
            ambilGambarDariFirebase()
          })
        }}>Add Image</Button>
      </DialogActions>
    </Dialog>
  </div>
  )
}

function App() {
  const [bData, setBData] = useState({})

  return (
    <BackendDataProvider value={{data: bData, setData: setBData}}>
      <Router>
        
        <div style={{width: '100%', height: '100%'}}>
          <Switch>
            <Route exact path='/'>
              <LoginPage/>
            </Route>
            <Route exact path='/home'>
              <MainPage/>
            </Route>
          </Switch>
        </div>
        
      </Router>
    </BackendDataProvider>
  )
}

export default App
