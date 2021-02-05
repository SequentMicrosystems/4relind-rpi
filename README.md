[![4relay-rpi](readmeres/sequent.jpg)](https://www.sequentmicrosystems.com)

# 4relplus-rpi


This is the command to control [4-RELAYS-Plus Heavy Duty Stackable Card for Raspberry Pi](https://sequentmicrosystems.com)

Don't forget to enable I2C communication:
```bash
~$ sudo raspi-config
```

## Usage

```bash
~$ git clone https://github.com/SequentMicrosystems/4relplus-rpi.git
~$ cd 4relplus-rpi/
~/4relplus-rpi$ sudo make install
```

Now you can access all the functions of the relays board through the command "4relplus". Use -h option for help:
```bash
~$ 4relplus -h
```

If you clone the repository any update can be made with the following commands:

```bash
~$ cd 4relplus-rpi/  
~/4relplus-rpi$ git pull
~/4relplus-rpi$ sudo make install
```  


