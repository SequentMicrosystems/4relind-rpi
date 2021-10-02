[![4relayind-rpi](../../readmeres/sequent.jpg)](https://sequentmicrosystems.com)

# lib4relayind

This is the python library to control the [4-RELAYS Heavy Duty Stackable Card for Raspberry Pi](https://sequentmicrosystems.com/product/raspberry-pi-relays-heavy-duty-hat/).

## Install

```bash
~$ sudo apt-get update
~$ sudo apt-get install build-essential python-pip python-dev python-smbus git
~$ git clone https://github.com/SequentMicrosystems/4relind-rpi.git
~$ cd 4relind-rpi/python/4relind/
~/4relind-rpi/python/4relind$ sudo python setup.py install
```
## Update

```bash
~$ cd 4relind-rpi/
~/4relind-rpi$ git pull
~$ cd 4relind-rpi/python/4relind/
~/4relind-rpi/python/4relind$ sudo python setup.py install
```

## Usage 

Now you can import the megaio library and use its functions. To test, read relays status from the board with stack level 0:

```bash
~$ python
Python 2.7.9 (default, Sep 17 2016, 20:26:04)
[GCC 4.9.2] on linux2
Type "help", "copyright", "credits" or "license" for more information.
>>> import lib4relind
>>> lib4relind.get_relay_all(0)
0
>>>
```

## Functions

### set_relay(stack, relay, value)
Set one relay state.

stack - stack level of the 4-Relay card (selectable from address jumpers [0..7])

relay - relay number (id) [1..4]

value - relay state 1: turn ON, 0: turn OFF[0..1]


### set_relay_all(stack, value)
Set all relays state.

stack - stack level of the 4-Relay card (selectable from address jumpers [0..7])

value - 4 bit value of all relays (ex: 15: turn on all relays, 0: turn off all relays, 1:turn on relay #1 and off the rest)

### get_relay(stack, relay)
Get one relay state.

stack - stack level of the 4-Relay card (selectable from address jumpers [0..7])

relay - relay number (id) [1..4]

return 0 == relay off; 1 - relay on

### get_relay_all(stack)
Return the state of all relays.

stack - stack level of the 4-Relay card (selectable from address jumpers [0..7])

return - [0..15]

### get_opto(stack, channel)
Get one relay state.

stack - stack level of the 4-Relay card (selectable from address jumpers [0..7])

channel - opto input channel number (id) [1..4]

return 0 == opto off; 1 - opto on

### get_opto_all(stack)
Return the state of all opto inputs.

stack - stack level of the 4-Relay card (selectable from address jumpers [0..7])

return - [0..15]
