
import React, {Component} from "react";
import { graphql, compose } from 'react-apollo';

import ChatInput from './components/ChatInput.js'
import ChatMessages from './components/ChatMessages'
import gql from 'graphql-tag';

export class Chatroom extends React.Component {
  constructor(props){
    super(props)

  }
  state = {
    //for correction
    correct_message: '',
    correct_message_id: null,
    //for messaging
    message: '',
    sender: null, 
    chat_id: null
  }
  
  componentDidMount(){
    this.setState({
      chat_id: this.props.location.state.chat_id,
      // chat_id: 11,
      sender: this.getCookie('user_id')
    })
    // this.props.chats_messageQuery({
    //   variables: {
    //     chat_id: this.state.chat_id
    //   }
    // })
  }
  getCookie = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  _onSend = () => {
    
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    this.props.insert_chat_messageMutation({
      variables: {
        message: this.state.message,
        // id: this.state.id,
        sender: this.state.sender,
        chat_id: 11,
        created: date,
      }
    })
  }

  _onCorrectionSend = () => {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    //do the correction upload
    this.props.insert_correction_messageMutation({
      variables: {
        corrected_message: this.state.correct_message,
        created: date,
        message_id: this.state.correct_message_id,
        corrected_by: this.state.sender
      }
    })
    //reset the state
    this.setState({
      correct_message_id: null
    })
  }

  _endRef = (element) => {
    this.endRef = element
  }

  correction = (message) => {
    this.setState({
      correct_message: message.message,
      correct_message_id: message.id
    })
  }

  render(){
    return(
      <div>
        <h1>Chatroom</h1>
        <ChatMessages
          messages={this.props.chats_messageSub.chats_message || []}
          endRef={this._endRef}
          correction={this.correction}
          user_id={this.state.sender}
        />
        <ChatInput
          message={this.state.message}
          onTextInput={(message) => this.setState({message})}
          onResetText={() => this.setState({message: ''})}
          onSend={this._onSend}
          disable={false}
          
        />
        <ChatInput
          message={this.state.correct_message}
          onTextInput={(correct_message) => this.setState({correct_message})}
          onResetText={() => this.setState({correct_message: ''})}
          onSend={this._onCorrectionSend}
          disable={!this.state.correct_message_id}
          placeHolder='Correction'
        />
      </div>
    )
  }

}

const chats_message= gql`
  query chats_message($chat_id: Int!){
    chats_message(where: {chat_id: { _eq: $chat_id}}) {
      message
      sender
      created
      chat_id
    }
  }
`

const insert_chats_message = gql`
  mutation insert_chats_message($chat_id: Int!, $created: date!, $message: String!, $sender: Int!) {
    insert_chats_message(objects: {chat_id: $chat_id, created: $created, message: $message, sender: $sender}) {
      returning {
        chat_id
        created
        id
        message
        sender
      }
    }
  }
`
const insert_correction_message = gql`
  mutation insert_chats_correction($corrected_message: String!, $corrected_by: Int!, $created: date!, $message_id: Int!){
    insert_chats_correction(objects: {corrected_message: $corrected_message, corrected_by: $corrected_by, created: $created, message_id: $message_id}) {
      returning {
        corrected_message
        created
        id
        message_id
        corrected_by
      }
    }
  }
`

const sub_chats_message = gql`
  subscription chats_message($chat_id: Int!){
    chats_message(where: {chat_id: { _eq: $chat_id}}) {
      message
      sender
      created
      chat_id
      id
    }
  }
`

const chats_in_chatroom = gql`
  query chats($chat_id: Int!){
    chats(where: {chat_members: {chat_id: {_eq: $chat_id}}}) {
      chat_members {
        user_interests {
          name {
            name
          }
        }
        user_id
        users {
          name
        }
      }
    }
  }
`

export default compose(
  graphql(chats_message, 
    {name: 'chats_messageQuery', 
      options: (props) => {
        return{
          variables: {
            chat_id: props.location.state.chat_id
          }
        }
      }
    }),
  graphql(chats_in_chatroom,
    {
      name: 'chats_in_chatroom',
      options: (props) => {
        return{
          variables: {
            chat_id: props.location.state.chat_id
          }
        }
      }
    }  
  ),
  graphql(insert_chats_message, {name: 'insert_chat_messageMutation'}),
  graphql(insert_correction_message, {name: "insert_correction_messageMutation"}),
  graphql(sub_chats_message, 
    {name: 'chats_messageSub', 
      options: (props) => {
        return{
          variables: {
            chat_id: 11
          }
        }
      }
    }),
)(Chatroom);