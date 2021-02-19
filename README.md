[![4relind-rpi](readmeres/sequent.jpg)](https://www.sequentmicrosystems.com)

# 4relind-rpi


This is the command to control [4-RELAYS-Plus Heavy Duty Stackable Card for Raspberry Pi](https://sequentmicrosystems.com)

Don't forget to enable I2C communication:
```bash
~$ sudo raspi-config
```

## Usage

```bash
~$ git clone https://github.com/SequentMicrosystems/4relind-rpi.git
~$ cd 4relind-rpi/
~/4relind-rpi$ sudo make install
```

Now you can access all the functions of the relays board through the command "4relplus". Use -h option for help:
```bash
~$ 4relind -h
```

If you clone the repository any update can be made with the following commands:

```bash
~$ cd 4relind-rpi/  
~/4relind-rpi$ git pull
~/4relind-rpi$ sudo make install
```  


