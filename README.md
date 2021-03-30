[![4relind-rpi](readmeres/sequent.jpg)](https://www.sequentmicrosystems.com)

# 4relind-rpi


This is the command to control [Four Relays four Inputs 8-Layer Stackable Card for Raspberry Pi](https://sequentmicrosystems.com/collections/all-io-cards/products/raspberry-pi-relays-heavy-duty-hat)

Don't forget to enable I2C communication:
```bash
~$ sudo raspi-config
```

## Install

```bash
~$ git clone https://github.com/SequentMicrosystems/4relind-rpi.git
~$ cd 4relind-rpi/
~/4relind-rpi$ sudo make install
```
## Usage
Now you can access all the functions of the card through the command "4relind". Use -h option for help:
```bash
~$ 4relind -h
```
## Update
If you clone the repository any update can be made with the following commands:

```bash
~$ cd 4relind-rpi/  
~/4relind-rpi$ git pull
~/4relind-rpi$ sudo make install
```  

Diferent software interfaces and examples are available:
* [Python Library](https://github.com/SequentMicrosystems/4relind-rpi/tree/main/python)
* [Python Example](https://github.com/SequentMicrosystems/4relind-rpi/blob/main/python/tests.py)
* [Node-Red Nodes](https://github.com/SequentMicrosystems/4relind-rpi/tree/main/node-red-contrib-sm-4relind) 
* [Node-Red Example](https://github.com/SequentMicrosystems/4relind-rpi/tree/main/node-red-contrib-sm-4relind/example)
