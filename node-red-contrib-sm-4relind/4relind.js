module.exports = function(RED) {
    "use strict";
    var I2C = require("i2c-bus");
    const DEFAULT_HW_ADD = 0x38;
    const INPUT_REG = 0x00;
    const OUT_REG = 0x01;
    const CFG_REG = 0x03;
    const mask = new ArrayBuffer(4);
    mask[0] = 0x80;
    mask[1] = 0x40;
    mask[2] = 0x20;
    mask[3] = 0x10;
    
    const inMask = new ArrayBuffer(4);
    inMask[0] = 0x08;
    inMask[1] = 0x04;
    inMask[2] = 0x02;
    inMask[3] = 0x01;
    
    // The relay Node
    function RelayNode(n) {
        RED.nodes.createNode(this, n);
        this.stack = parseInt(n.stack);
        this.relay = parseInt(n.relay);
        this.payload = n.payload;
        this.payloadType = n.payloadType;
        var node = this;
 
        node.port = I2C.openSync( 1 );
        node.on("input", function(msg) {
            var myPayload;
            var stack = node.stack;
            if (isNaN(stack)) stack = msg.stack;
            stack = parseInt(stack);
            var relay = node.relay;
            if (isNaN(relay)) relay = msg.relay;
            relay = parseInt(relay);
            //var buffcount = parseInt(node.count);
            if (isNaN(stack + 1)) {
                this.status({fill:"red",shape:"ring",text:"Stack level ("+stack+") value is missing or incorrect"});
                return;
            } else if (isNaN(relay) ) {
                this.status({fill:"red",shape:"ring",text:"Relay number  ("+relay+") value is missing or incorrect"});
                return;
            } else {
                this.status({});
            }
            var hwAdd = DEFAULT_HW_ADD;
            var found = 1;
            if(stack < 0){
                stack = 0;
            }
            if(stack > 7){
              stack = 7;
            }
            //check the type of io_expander
            var st = stack;// for hw ver < 1.1(stack & 0x02) + (0x01 & (stack >> 2)) + (0x04 & (stack << 2));
            hwAdd += st ^ 0x07;
            var direction = 0xaa;
            try{
                direction = node.port.readByteSync(hwAdd, CFG_REG );
            }catch(err) {
                found = 0;
                this.error(err,msg);
            }
            
            if(1 == found){
            try {
                if (this.payloadType == null) {
                    myPayload = this.payload;
                } else if (this.payloadType == 'none') {
                    myPayload = null;
                } else {
                    myPayload = RED.util.evaluateNodeProperty(this.payload, this.payloadType, this,msg);
                }
                if(direction != 0x0f){
                    node.port.writeByteSync(hwAdd, OUT_REG, 0x00);
                    node.port.writeByteSync(hwAdd, CFG_REG, 0x0f);
                    //node.log('First update direction');  
                }
                var relayVal = 0;    
                relayVal = node.port.readByteSync(hwAdd, OUT_REG);
                //node.log('Relays ' + String(relayVal));
                if(relay < 0){
                  relay = 0;
                }
                if(relay > 4){
                  relay = 4;
                }
                if(relay == 0){
                  if(isNaN(myPayload)){
                    //error message
                  }
                  else{
                    var i = 0;
                    var newRelayVal = 0;
                    for(i = 0; i<4; i++){
                      if(((1<<i) & myPayload) != 0){
                        newRelayVal |= mask[i];
                      }
                    }
                    relayVal = newRelayVal;
                  }
                    
                }
                else{
                  relay-= 1;//zero based
                  if (myPayload == null || myPayload == false || myPayload == 0 || myPayload == 'off') {
                    relayVal &= ~mask[relay];
                  } else {
                    relayVal |= mask[relay];
                  }
                }
                node.port.writeByte(hwAdd, OUT_REG, relayVal,  function(err) {
                    if (err) { node.error(err, msg);
                    } else {
                      node.send(msg);
                    }
                });
            } catch(err) {
                this.error(err,msg);
            }
          }
        });

        node.on("close", function() {
            node.port.closeSync();
        });
    }
    RED.nodes.registerType("4relind", RelayNode);

    // The relay read Node
    function RelayReadNode(n) {
        RED.nodes.createNode(this, n);
        this.stack = parseInt(n.stack);
        this.relay = parseInt(n.relay);
        this.payload = n.payload;
        this.payloadType = n.payloadType;
        var node = this;
 
        node.port = I2C.openSync( 1 );
        node.on("input", function(msg) {
            var myPayload;
            var stack = node.stack;
            if (isNaN(stack)) stack = msg.stack;
            stack = parseInt(stack);
            var relay = node.relay;
            if (isNaN(relay)) relay = msg.relay;
            relay = parseInt(relay);
            //var buffcount = parseInt(node.count);
            if (isNaN(stack + 1)) {
                this.status({fill:"red",shape:"ring",text:"Stack level ("+stack+") value is missing or incorrect"});
                return;
            } else if (isNaN(relay) ) {
                this.status({fill:"red",shape:"ring",text:"Relay number  ("+relay+") value is missing or incorrect"});
                return;
            } else {
                this.status({});
            }
            var hwAdd = DEFAULT_HW_ADD;
            var found = 1;
            if(stack < 0){
                stack = 0;
            }
            if(stack > 7){
              stack = 7;
            }
            //check the type of io_expander
            var st = stack;// for hw ver < 1.1(stack & 0x02) + (0x01 & (stack >> 2)) + (0x04 & (stack << 2));
            hwAdd += st ^ 0x07;
            var direction = 0xaa;
            try{
                direction = node.port.readByteSync(hwAdd, CFG_REG );
            }catch(err) {               
                found = 0;
                this.error(err,msg);
            }
            
            if(1 == found){
            try {
                if (this.payloadType == null) {
                    myPayload = this.payload;
                } else if (this.payloadType == 'none') {
                    myPayload = null;
                } else {
                    myPayload = RED.util.evaluateNodeProperty(this.payload, this.payloadType, this,msg);
                }
                
                if(direction != 0x0f){
                    node.port.writeByteSync(hwAdd, OUT_REG, 0x00);                    
                    node.port.writeByteSync(hwAdd, CFG_REG, 0x0f);
                }
                var relayVal = 0;    
                relayVal = node.port.readByteSync(hwAdd, OUT_REG);
                if(relay < 0){
                  relay = 0;
                }
                if(relay > 4){
                  relay = 4;
                }
                if(relay == 0){
                    var i = 0;
                    var newRelayVal = 0;
                    for(i = 0; i<4; i++){
                      if(( mask[i]& relayVal) != 0){
                        newRelayVal |= 1<<i ;
                      }
                    }
                    msg.payload = newRelayVal;  
                }
                else{
                  relay-= 1;//zero based
                  if(relayVal & mask[relay])
                  {
                    msg.payload = 1;
                  }
                  else
                  {
                    msg.payload = 0;
                  }
                }
                node.send(msg);
               
            } catch(err) {
                this.error(err,msg);
            }
          }
        });

        node.on("close", function() {
            node.port.closeSync();
        });
    }
    RED.nodes.registerType("4relindrd", RelayReadNode);

    // The opto-in read Node
    function OptoReadNode(n) {
        RED.nodes.createNode(this, n);
        this.stack = parseInt(n.stack);
        this.channel = parseInt(n.channel);
        this.payload = n.payload;
        this.payloadType = n.payloadType;
        var node = this;
 
        node.port = I2C.openSync( 1 );
        node.on("input", function(msg) {
            var myPayload;
            var stack = node.stack;
            if (isNaN(stack)) stack = msg.stack;
            stack = parseInt(stack);
            var channel = node.channel;
            if (isNaN(channel + 1)) channel = msg.channel;
            channel = parseInt(channel);
            //var buffcount = parseInt(node.count);
            if (isNaN(stack + 1)) {
                this.status({fill:"red",shape:"ring",text:"Stack level ("+stack+") value is missing or incorrect"});
                return;
            } else if (isNaN(channel + 1) ) {
                this.status({fill:"red",shape:"ring",text:"Channel number  ("+channel+") value is missing or incorrect"});
                return;
            } else {
                this.status({});
            }
            var hwAdd = DEFAULT_HW_ADD;
            var found = 1;
            if(stack < 0){
                stack = 0;
            }
            if(stack > 7){
              stack = 7;
            }
            //check the type of io_expander
            var st = stack;// for hw ver < 1.1(stack & 0x02) + (0x01 & (stack >> 2)) + (0x04 & (stack << 2));
            hwAdd += st ^ 0x07;
            var direction = 0xaa;
            try{
                direction = node.port.readByteSync(hwAdd, CFG_REG );
            }catch(err) {               
                found = 0;
                this.error(err,msg);
            }
            
            if(1 == found){
            try {
                if (this.payloadType == null) {
                    myPayload = this.payload;
                } else if (this.payloadType == 'none') {
                    myPayload = null;
                } else {
                    myPayload = RED.util.evaluateNodeProperty(this.payload, this.payloadType, this,msg);
                }
                
                if(direction != 0x0f){
                    node.port.writeByteSync(hwAdd, OUT_REG, 0x00);                    
                    node.port.writeByteSync(hwAdd, CFG_REG, 0x0f);
                }
                var relayVal = 0;    
                relayVal = node.port.readByteSync(hwAdd, INPUT_REG);
                if(channel < 0){
                  channel = 0;
                }
                if(channel > 4){
                  channel = 4;
                }
                if(channel == 0){
                    var i = 0;
                    var newRelayVal = 0;
                    for(i = 0; i<4; i++){
                      if(( inMask[i] & relayVal) == 0){// inverted input
                        newRelayVal |= 1<<i ;
                      }
                    }
                    msg.payload = newRelayVal;  
                }
                else{
                  channel-= 1;//zero based
                  if(relayVal & inMask[channel])
                  {
                    msg.payload = 0;
                  }
                  else
                  {
                    msg.payload = 1;
                  }
                }
                node.send(msg);
               
            } catch(err) {
                this.error(err,msg);
            }
          }
        });

        node.on("close", function() {
            node.port.closeSync();
        });
    }
    RED.nodes.registerType("4relindin", OptoReadNode);
}
