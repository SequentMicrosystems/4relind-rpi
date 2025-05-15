module.exports = function (RED) {
  "use strict";
  var I2C = require("i2c-bus");
  const DEFAULT_HW_ADD = 0x38;
  const ALTERNATE_HW_ADD = 0x20;
  const CPU_TYPE_HW_ADD = 0x0e;
  const INPUT_REG = 0x00;
  const OUT_REG = 0x01;
  const CFG_REG = 0x03;
  //cpu type card
  const I2C_MEM_RELAY_VAL = 0x00;
  const I2C_MEM_AC_IN = 0x04;
  const SLAVE_OWN_ADDRESS_BASE = 0x0e
  const CARD_TYPE_IO_EXP = 0
  const CARD_TYPE_CPU = 1
  
  
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

    node.port = I2C.openSync(1);
    node.on("input", function (msg) {
      var myPayload;
      var stack = node.stack;
      if (isNaN(stack)) stack = msg.stack;
      stack = parseInt(stack);
      var relay = node.relay;
      if (isNaN(relay)) relay = msg.relay;
      relay = parseInt(relay);
      //var buffcount = parseInt(node.count);
      if (isNaN(stack + 1)) {
        this.status({
          fill: "red",
          shape: "ring",
          text: "Stack level (" + stack + ") value is missing or incorrect",
        });
        return;
      } else if (isNaN(relay)) {
        this.status({
          fill: "red",
          shape: "ring",
          text: "Relay number  (" + relay + ") value is missing or incorrect",
        });
        return;
      } else {
        this.status({});
      }
      var hwAdd = DEFAULT_HW_ADD;
      var found = 1;
	  var type = CARD_TYPE_IO_EXP;
      if (stack < 0) {
        stack = 0;
      }
      if (stack > 7) {
        stack = 7;
      }
      //check the type of io_expander
      var st = stack; // for hw ver < 1.1(stack & 0x02) + (0x01 & (stack >> 2)) + (0x04 & (stack << 2));
      hwAdd += st ^ 0x07;
      var direction = 0xaa;
      try {
        direction = node.port.readByteSync(hwAdd, CFG_REG);
      } catch (err) {
        hwAdd = ALTERNATE_HW_ADD;
        hwAdd += stack ^ 0x07;
        try {
          direction = node.port.readByteSync(hwAdd, CFG_REG);
        } catch (err) {
			hwAdd = SLAVE_OWN_ADDRESS_BASE;
			hwAdd += stack;
			type = CARD_TYPE_CPU;
			try {
				direction = node.port.readByteSync(hwAdd, I2C_MEM_RELAY_VAL);
			}catch (err){
			found = 0;
			this.error(err, msg);
			}
		}
      }

      if (1 == found) {
        try {
          if (this.payloadType == null) {
            myPayload = this.payload;
          } else if (this.payloadType == "none") {
            myPayload = null;
          } else {
            myPayload = RED.util.evaluateNodeProperty(
              this.payload,
              this.payloadType,
              this,
              msg
            );
          }
          if (direction != 0x0f && type == CARD_TYPE_IO_EXP) {
            node.port.writeByteSync(hwAdd, OUT_REG, 0x00);
            node.port.writeByteSync(hwAdd, CFG_REG, 0x0f);
            //node.log('First update direction');
          }
          var relayVal = 0;
		  if(type == CARD_TYPE_IO_EXP){
			relayVal = node.port.readByteSync(hwAdd, OUT_REG);
		  } else {
			  relayVal = direction;
		  }
          //node.log('Relays ' + String(relayVal));
          if (relay < 0) {
            relay = 0;
          }
          if (relay > 4) {
            relay = 4;
          }
          if (relay == 0) {
            if (isNaN(myPayload)) {
              //error message
            } else {
				if(type == CARD_TYPE_IO_EXP){  
				  var i = 0;
				  var newRelayVal = 0;
				  for (i = 0; i < 4; i++) {
				    if (((1 << i) & myPayload) != 0) {
					    newRelayVal |= mask[i];
					  }
				    }
			    } else{
				  newRelayVal = 0x0f & myPayload;
			    }
              relayVal = newRelayVal;
              }
          } else { 
            relay -= 1; //zero based
			var tempMask = mask[relay];
			if(type == CARD_TYPE_CPU){
				tempMask = 1 << relay;
			}
            if (
              myPayload == null ||
              myPayload == false ||
              myPayload == 0 ||
              myPayload == "off"
            ) {
              relayVal &= ~tempMask;
            } else {
              relayVal |= tempMask;
            }
          }
		  var regAdd = OUT_REG;
		  if(type == CARD_TYPE_CPU){
			  regAdd = I2C_MEM_RELAY_VAL;
		  }
          node.port.writeByte(hwAdd, regAdd, relayVal, function (err) {
            if (err) {
              node.error(err, msg);
            } else {
              node.send(msg);
            }
          });
        } catch (err) {
          this.error(err, msg);
        }
      }
    });

    node.on("close", function () {
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

    node.port = I2C.openSync(1);
    node.on("input", function (msg) {
      var myPayload;
      var stack = node.stack;
      if (isNaN(stack)) stack = msg.stack;
      stack = parseInt(stack);
      var relay = node.relay;
      if (isNaN(relay)) relay = msg.relay;
      relay = parseInt(relay);
      //var buffcount = parseInt(node.count);
      if (isNaN(stack + 1)) {
        this.status({
          fill: "red",
          shape: "ring",
          text: "Stack level (" + stack + ") value is missing or incorrect",
        });
        return;
      } else if (isNaN(relay)) {
        this.status({
          fill: "red",
          shape: "ring",
          text: "Relay number  (" + relay + ") value is missing or incorrect",
        });
        return;
      } else {
        this.status({});
      }
      var hwAdd = DEFAULT_HW_ADD;
      var found = 1;
	  var type = CARD_TYPE_IO_EXP;
      if (stack < 0) {
        stack = 0;
      }
      if (stack > 7) {
        stack = 7;
      }
      //check the type of io_expander
      var st = stack; // for hw ver < 1.1(stack & 0x02) + (0x01 & (stack >> 2)) + (0x04 & (stack << 2));
      hwAdd += st ^ 0x07;
      var direction = 0xaa;
      try {
        direction = node.port.readByteSync(hwAdd, CFG_REG);
      } catch (err) {
        hwAdd = ALTERNATE_HW_ADD;
        hwAdd += stack ^ 0x07;
        try {
          direction = node.port.readByteSync(hwAdd, CFG_REG);
        } catch (err) {
          hwAdd = SLAVE_OWN_ADDRESS_BASE;
		  hwAdd += stack;
		  type = CARD_TYPE_CPU;
		  try {
			direction = node.port.readByteSync(hwAdd, I2C_MEM_RELAY_VAL );
		  }catch (err){
		  found = 0;
		  this.error(err, msg);
		  }
		}
      }

      if (1 == found) {
        try {
          if (this.payloadType == null) {
            myPayload = this.payload;
          } else if (this.payloadType == "none") {
            myPayload = null;
          } else {
            myPayload = RED.util.evaluateNodeProperty(
              this.payload,
              this.payloadType,
              this,
              msg
            );
          }

          if (direction != 0x0f && type == CARD_TYPE_IO_EXP) {
            node.port.writeByteSync(hwAdd, OUT_REG, 0x00);
            node.port.writeByteSync(hwAdd, CFG_REG, 0x0f);
          }
          var relayVal = direction;
		  if(type == CARD_TYPE_IO_EXP) relayVal = node.port.readByteSync(hwAdd, OUT_REG);
          if (relay < 0) {
            relay = 0;
          }
          if (relay > 4) {
            relay = 4;
          }
          if (relay == 0) {
            var i = 0;
            var newRelayVal = relayVal;
			if(type == CARD_TYPE_IO_EXP){
              for (i = 0; i < 4; i++) {
                if ((mask[i] & relayVal) != 0) {
                  newRelayVal |= 1 << i;
                }
              }  
			}
            msg.payload = newRelayVal;
          } else {
            relay -= 1; //zero based
			var tempMask = 1<< relay;
			if(type == CARD_TYPE_IO_EXP) tempMask = mask[relay];
            if (relayVal & tempMask) {
              msg.payload = 1;
            } else {
              msg.payload = 0;
            }
          }
          node.send(msg);
        } catch (err) {
          this.error(err, msg);
        }
      }
    });

    node.on("close", function () {
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

    node.port = I2C.openSync(1);
    node.on("input", function (msg) {
      var myPayload;
      var stack = node.stack;
      if (isNaN(stack)) stack = msg.stack;
      stack = parseInt(stack);
      var channel = node.channel;
      if (isNaN(channel + 1)) channel = msg.channel;
      channel = parseInt(channel);
      //var buffcount = parseInt(node.count);
      if (isNaN(stack + 1)) {
        this.status({
          fill: "red",
          shape: "ring",
          text: "Stack level (" + stack + ") value is missing or incorrect",
        });
        return;
      } else if (isNaN(channel + 1)) {
        this.status({
          fill: "red",
          shape: "ring",
          text:
            "Channel number  (" + channel + ") value is missing or incorrect",
        });
        return;
      } else {
        this.status({});
      }
      var hwAdd = DEFAULT_HW_ADD;
      var found = 1;
	  var type = CARD_TYPE_IO_EXP;
      if (stack < 0) {
        stack = 0;
      }
      if (stack > 7) {
        stack = 7;
      }
      //check the type of io_expander
      var st = stack; // for hw ver < 1.1(stack & 0x02) + (0x01 & (stack >> 2)) + (0x04 & (stack << 2));
      hwAdd += st ^ 0x07;
      var direction = 0xaa;
      try {
        direction = node.port.readByteSync(hwAdd, CFG_REG);
      } catch (err) {
        hwAdd = ALTERNATE_HW_ADD;
        hwAdd += st ^ 0x07;
        try {
          direction = node.port.readByteSync(hwAdd, CFG_REG);
        } catch (err) {
          hwAdd = SLAVE_OWN_ADDRESS_BASE;
		  hwAdd += stack;
		  type = CARD_TYPE_CPU;
		  try {
			direction = node.port.readByteSync(hwAdd, I2C_MEM_AC_IN );
		  }catch (err){
		  found = 0;
		  this.error(err, msg);
		  }
        }
      }

      if (1 == found) {
        try {
          if (this.payloadType == null) {
            myPayload = this.payload;
          } else if (this.payloadType == "none") {
            myPayload = null;
          } else {
            myPayload = RED.util.evaluateNodeProperty(
              this.payload,
              this.payloadType,
              this,
              msg
            );
          }

          if (direction != 0x0f && type == CARD_TYPE_IO_EXP) {
            node.port.writeByteSync(hwAdd, OUT_REG, 0x00);
            node.port.writeByteSync(hwAdd, CFG_REG, 0x0f);
          }
          var relayVal = 0;
		  if(type == CARD_TYPE_IO_EXP){
			relayVal = node.port.readByteSync(hwAdd, INPUT_REG);
		  } else{
			relayVal = direction;
		  }
          if (channel < 0) {
            channel = 0;
          }
          if (channel > 4) {
            channel = 4;
          }
          if (channel == 0) {
            var i = 0;
            var newRelayVal = 0;
			
            if(type == CARD_TYPE_IO_EXP){
			  for (i = 0; i < 4; i++) {
				if ((inMask[i] & relayVal) == 0) {
                // inverted input
				  newRelayVal |= 1 << i;
				}
              }
			}else{
				newRelayVal = relayVal;
			}
            msg.payload = newRelayVal;
          } else {
            channel -= 1; //zero based
			if(type == CARD_TYPE_CPU) {				
			  if (relayVal & (1 << channel) ){
                msg.payload = 1;
              } else {
                msg.payload = 0;
              }
			}else{
              if (relayVal & inMask[channel]) {
                msg.payload = 0;
              } else {
                msg.payload = 1;
              }
			}
          }
          node.send(msg);
        } catch (err) {
          this.error(err, msg);
        }
      }
    });

    node.on("close", function () {
      node.port.closeSync();
    });
  }
  RED.nodes.registerType("4relindin", OptoReadNode);

  const I2C_MEM_IN_FREQUENCY = 53;
  const I2C_MEM_PWM_IN_FILL = 45;
  const I2C_MEM_PPS = 29;
  const FREQ_SIZE_BYTES = 2;

  function FrequencyReadNode(n) {
    RED.nodes.createNode(this, n);
    this.stack = parseInt(n.stack);
    this.channel = parseInt(n.channel);
    this.payload = n.payload;
    this.payloadType = n.payloadType;
    var node = this;

    node.port = I2C.openSync(1);
    node.on("input", function (msg) {
      var stack = node.stack;
      if (isNaN(stack)) stack = msg.stack;
      stack = parseInt(stack);
      var channel = node.channel;
      if (isNaN(channel)) channel = msg.channel;
      channel = parseInt(channel);
      
      if (isNaN(stack + 1)) {
        this.status({
          fill: "red",
          shape: "ring",
          text: "Stack level (" + stack + ") value is missing or incorrect",
        });
        return;
      } else if (isNaN(channel)) {
        this.status({
          fill: "red",
          shape: "ring",
          text: "Channel number (" + channel + ") value is missing or incorrect",
        });
        return;
      } else {
        this.status({});
      }
      
      if (stack < 0) stack = 0;
      if (stack > 7) stack = 7;
      if (channel < 1) channel = 1;
      if (channel > 4) channel = 4;

      var hwAdd = SLAVE_OWN_ADDRESS_BASE + stack;
      
      try {
        var memAddr = I2C_MEM_IN_FREQUENCY + (channel - 1) * FREQ_SIZE_BYTES;
        
        var frequency = 0;
        try {
          frequency = node.port.readWordSync(hwAdd, memAddr);
        } catch (err) {
          node.error("Error reading frequency: " + err.message);
        }
        
        msg.payload = frequency;
        node.send(msg);
      } catch (err) {
        this.error(err, msg);
      }
    });

    node.on("close", function () {
      node.port.closeSync();
    });
  }
  RED.nodes.registerType("4relindfrequency", FrequencyReadNode);

  function PwmFillReadNode(n) {
    RED.nodes.createNode(this, n);
    this.stack = parseInt(n.stack);
    this.channel = parseInt(n.channel);
    this.payload = n.payload;
    this.payloadType = n.payloadType;
    var node = this;

    node.port = I2C.openSync(1);
    node.on("input", function (msg) {
      var stack = node.stack;
      if (isNaN(stack)) stack = msg.stack;
      stack = parseInt(stack);
      var channel = node.channel;
      if (isNaN(channel)) channel = msg.channel;
      channel = parseInt(channel);
      
      if (isNaN(stack + 1)) {
        this.status({
          fill: "red",
          shape: "ring",
          text: "Stack level (" + stack + ") value is missing or incorrect",
        });
        return;
      } else if (isNaN(channel)) {
        this.status({
          fill: "red",
          shape: "ring",
          text: "Channel number (" + channel + ") value is missing or incorrect",
        });
        return;
      } else {
        this.status({});
      }
      
      if (stack < 0) stack = 0;
      if (stack > 7) stack = 7;
      if (channel < 1) channel = 1;
      if (channel > 4) channel = 4;

      var hwAdd = SLAVE_OWN_ADDRESS_BASE + stack;
      
      try {
        var memAddr = I2C_MEM_PWM_IN_FILL + (channel - 1) * FREQ_SIZE_BYTES;
        
        var pwmFill = 0;
        try {
          var rawValue = node.port.readWordSync(hwAdd, memAddr);
          pwmFill = rawValue / 100;
        } catch (err) {
          node.error("Error reading PWM fill: " + err.message);
        }
        
        msg.payload = pwmFill;
        node.send(msg);
      } catch (err) {
        this.error(err, msg);
      }
    });

    node.on("close", function () {
      node.port.closeSync();
    });
  }
  RED.nodes.registerType("4relindpwmfill", PwmFillReadNode);

  function PpsReadNode(n) {
    RED.nodes.createNode(this, n);
    this.stack = parseInt(n.stack);
    this.channel = parseInt(n.channel);
    this.payload = n.payload;
    this.payloadType = n.payloadType;
    var node = this;

    node.port = I2C.openSync(1);
    node.on("input", function (msg) {
      var stack = node.stack;
      if (isNaN(stack)) stack = msg.stack;
      stack = parseInt(stack);
      var channel = node.channel;
      if (isNaN(channel)) channel = msg.channel;
      channel = parseInt(channel);
      
      if (isNaN(stack + 1)) {
        this.status({
          fill: "red",
          shape: "ring",
          text: "Stack level (" + stack + ") value is missing or incorrect",
        });
        return;
      } else if (isNaN(channel)) {
        this.status({
          fill: "red",
          shape: "ring",
          text: "Channel number (" + channel + ") value is missing or incorrect",
        });
        return;
      } else {
        this.status({});
      }
      
      if (stack < 0) stack = 0;
      if (stack > 7) stack = 7;
      if (channel < 1) channel = 1;
      if (channel > 4) channel = 4;

      var hwAdd = SLAVE_OWN_ADDRESS_BASE + stack;
      
      try {
        var memAddr = I2C_MEM_PPS + (channel - 1) * FREQ_SIZE_BYTES;
        
        var pps = 0;
        try {
          pps = node.port.readWordSync(hwAdd, memAddr);
        } catch (err) {
          node.error("Error reading PPS: " + err.message);
        }
        
        msg.payload = pps;
        node.send(msg);
      } catch (err) {
        this.error(err, msg);
      }
    });

    node.on("close", function () {
      node.port.closeSync();
    });
  }
  RED.nodes.registerType("4relindpps", PpsReadNode);
};
