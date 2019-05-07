import React, { Component} from 'react';
import ChatMessage from "./ChatMessage"

class ChatMessages extends Component {
    
    render() {
      const {correction} = this.props
      console.log(this.props.messages)
      return (
        <div className='ChatMessages'>
          {this.props.messages.map((message, i) => {
            return (
            <div>
              <ChatMessage
                key={i}
                message={message.message}
              />
              {message.sender != this.props.user_id
                ?<button onClick={correction.bind(this, message)}>Correction</button>
                :null
              }
            </div>
            )
          })}
          <div style={ {float:"left", clear: "both"} }
               ref={el => { this.props.endRef(el) }}></div>
        </div>
      )
    }
  
  }
  
  export default ChatMessages