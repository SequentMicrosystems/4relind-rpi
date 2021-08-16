[![4relind-rpi](../readmeres/sequent.jpg)](https://sequentmicrosystems.com)

# node-red-contrib-sm-4relind

This is the node-red node to control Sequent Microsystems [Four Relays four Inputs 8-Layer Stackable Card for Raspberry Pi](https://sequentmicrosystems.com/collections/all-io-cards/products/raspberry-pi-relays-heavy-duty-hat).

## Manual Install

Clone or update the repository, follow the instrutions fron the [first page.](https://github.com/SequentMicrosystems/4relind-rpi)

In your node-red user directory, tipicaly ~/.node-red,

```bash
~$ cd ~/.node-red
```

Run the following command:

```bash
~/.node-red$ npm install ~/4relind-rpi/node-red-contrib-sm-4relind
```

In order to see the node in the palette and use-it you need to restart node-red. If you run node-red as a service:
 ```bash
 ~$ node-red-stop
 ~& node-red-start
 ```

## Usage

After install and restart the node-red you will see on the node palete, under Sequent Microsystems category the fallowing nodes:

### 4relind
This node will turn on or off a relay. 
The card stack level and relay number can be set in the dialog screen or dinamicaly thru ``` msg.stack``` and ``` msg.relay ```. 
The output of the relay can be set dynamically as a boolean, number or string using msg.payload.
If you need to set all relays at a time, set relay number to 0 and send thru msg.payload a value that binary corespond to the state of the relays. 

### 4relindrd
This node reads the status of a relay.
The card stack level and relay number can be set in the dialog screen or dinamicaly thru ``` msg.stack``` and ``` msg.relay ```.
This node will output the state of one relay if the relay number is [1..4] or the state of all relays if the relay number is 0

### 4relindin
This node reads the status of a optically isolated input.
The card stack level and input channel number can be set in the dialog screen or dinamicaly thru ``` msg.stack``` and ``` msg.channel ```.
This node will output the state of one input channel if the channel number is [1..4] or the state of all inputs if the channel number is 0

## Important note

This node is using the I2C-bus package from @fivdi, you can visit his work on github [here](https://github.com/fivdi/i2c-bus). 
The inspiration for this node came from @nielsnl68 work with [node-red-contrib-i2c](https://github.com/nielsnl68/node-red-contrib-i2c).Thank both for the great job.
