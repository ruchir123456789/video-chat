const PRE = "DELTA"
const SUF = "MEET"

var room_Id;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var local_stream;
var screenStream;
var peer =null;
var currentPeer=null;
var screenSharing =false;

function createRoom(){
    console.log("creating Room");
    let room = document.getElementById("room-input").value;
    if(room == " " || room ==""){
        alert("please enter room number")
        return;
    }

room_Id = PRE+ room+SUF;
var peer = new Peer(room_Id);
peer.on('open',(id)=>{
    console.log("Peer Connected with ID:",id)
    hideModal()
    getUserMedia({video: true, audio: true}, (stream)=>{
        local_stream = stream;
        setLocalStream(local_stream)
    },(err)=>{
        console.log(err);
    })
    notify("waiting for peer to join")
})

peer.on('call', (call)=>{
    call.answer(local_stream);

    call.on('stream',(stream)=>{
        setRemoteStream(stream)
    })
    currentPeer = call;

})

}



function setRemoteStream(stream){
 let video=document.getElementById("remote-video");
 video.srcObject=stream;
 video.play();
}




function setLocalStream(stream){
    let video = document.getElementById("local-video");
    video.srcObject=stream;
    video.muted=true;
    video.play();

}



function hideModal(){
    document.getElementById("entry-modal").hidden=true;
}

function notify(msg){
    let notificaton =document.getElementById("notification");
    notificaton.innerHTML=msg;
    notificaton.hidden=false;
    setTimeout(() => {
        notificaton.hidden=true;
    }, 3000);

}

function joinRoom(){
    console.log("joining-room");
    let room = document.getElementById("room-input").value;
    if(room == " " || room ==""){
        alert("plaese enter room number");
        return;
    }
    room_Id=PRE+room+SUF;
    hideModal();
    peer = new Peer();
    peer.on('open',(id)=>{
        console.log("connected with ID:" +id);
        getUserMedia({video: true, audio: true}, function(stream){
            local_stream=stream;
            setLocalStream(local_stream);
            notify('joining peer');
            let call = peer.call(room_Id,stream);//in call variable we stored the calling data of the room_Id
            call.on('stream',(stream)=>{
                setRemoteStream(stream);
            })
            currentPeer=call;


        },(err)=>{
            console.log(err);
        })

    })

}

function startScreenShare(){
    if(screenSharing){
        stopscreenSharing()
    }
    navigator.mediaDevices.getDisplayMedia({video:true}).then((stream)=>{ 
    screenStream=stream;
    let videoTrack =sreenStream.getVideoTracks()[0];
    videoTrack.onended =()=>{
        stopscreenSharing()
    }
    if(peer){
     //array of trackable data is sended by the sender
        let sender = currentPeer.peerConnection.getSenders().find(function(s){
           //kind contains the string of video and sees in which senarios the track is to be enebaled 
            return s.track.kind == videoTrack.kind;
        })
        // ko kerta
        //current track is  replced by the replaceTrack() function
        sender.replaceTrack(videoTrack)
        screenSharing= true
    }
      console.log(screenStream)
})

}

function stopscreenSharing(){
   if(!screenSharing )return;
   let videoTrack =local_stream.getVideoTracks()[0];
   if(peer){
         let sender = currentPeer.peerConnection.getSenders().find(function(s){
           return s.track.kind == videoTrack.kind;
         })
         sender.replaceTrack(videoTrack);

        }
        //gatTrack() retuns the sequence of  all the object of videoTrack or mediaScreenTrack
        screenStream.getTracks().forEach(function(track){
            track.stop();

        });
        screenSharing=false;
}