/* windowsBleToggle.js
 * Implement BLE toggle function for Windows.
 */

module.exports = function () {
"use strict";

var BLE_DEVICE_UUID = "19B10000-E8F2-537C-4F6C-D104768BC101";
var BLE_CHARACTERISTIC_UUID = "19B10001-E8F2-537C-4F6C-D104768BC101";

var platform = require('os').platform();

if (platform === 'win32') {
    // Do something special on Win32 because noble isn't supported without
    // hacking apart your entire Bluetooth driver stack.

    /*
     * Need to autogenerate the 'windows.name.space' modules using NodeRT
     *   Please see:  https://github.com/NodeRT/NodeRT
     */
    var storage_streams = require('@nodert-win10/windows.storage.streams');

    var gattProfile = require('@nodert-win10/windows.devices.bluetooth.genericattributeprofile');
    var gattDevService = gattProfile.GattDeviceService;

    var enumeration = require('@nodert-win10/windows.devices.enumeration');
    var devInfo = enumeration.DeviceInformation;

    // Unfortunately the NodeRT project doesn't support promises at this time.
    /*
    var devInfoCollection = devInfo.findAllAsync(devSelector, null).done(
        function success(result){},
        function failure(errorStatus){});
    */

    // General approach to using BLE Central on Windows
    // 1. Generate a device selector from a GATT device UUID (BLE_DEVICE_UUID)
    // 2. First find the device from the Device Manager using the selector
    // 3. Cast it into a GATT device service using gattDevice.fromIDAsync
    // 4. Locate the characteristic we want using getCharacterics (BLE_CHARACTERISTIC_UUID)
    // 5. Manipulate value of characteristic using read/write functions.

    var devSelector = gattDevService.getDeviceSelectorFromUuid(BLE_DEVICE_UUID);

    var devInfoCollection = devInfo.findAllAsync(devSelector, null, function(error, result) {
        if (error) {
            console.error(error);
            return;
        }
        if (result) {
            var firstResult = result.first();
            if (firstResult.hasCurrent) {
               var firstResultValue = firstResult.current;
               gattDevService.fromIdAsync(firstResultValue.id, function(error, result) {
                   if (error) {
                       console.error(error);
                       return;
                   }
                   if (result) {
                       var characteristics = result.getCharacteristics(BLE_CHARACTERISTIC_UUID);
                       if (characteristics) {
                           console.info("BLE characteristics retrieved");
                           var firstCharacteristic = characteristics.first().current;
                           if (firstCharacteristic) {

                               // Print out descriptor
                               var descriptors = firstCharacteristic.getAllDescriptors();
                               var firstDescriptor = descriptors.first().current;
                               if (firstDescriptor) {
                                   console.info(firstDescriptor.uuid);
                                   firstDescriptor.readValueAsync(function(error, result) {
                                       if (error) {
                                           console.error(error);
                                           return;
                                       }
                                       if (result) {
                                           // TODO: Do something with this.
                                           console.info("readValueAsync: result = ");
                                           console.info(result);
                                       }
                                   });
                               }

                               // Write the characteristic

                               // set command to 0x1, speaker switch
                               var commandValue = 1;

                               // Build a buffer with a DataWriter
                               var dataWriter = new storage_streams.DataWriter(
                                                    new storage_streams.InMemoryRandomAccessStream()
                                                );

                               dataWriter.writeByte(commandValue);

                               if (dataWriter.unstoredBufferLength !== 1) {
                                   console.error("Buffer wrote too much!!");
                                   return;
                               }

                               var buffer = dataWriter.detachBuffer();
                               firstCharacteristic.writeValueAsync(buffer, function(error, result) {
                                   dataWriter.close();
                                   if (error) {
                                       console.error(error);
                                       return;
                                   }
                                   if (result) {
                                       console.info("Wrote value async!");
                                       console.info("writeValueAsync: result = ");
                                       console.info(result);
                                   } else {
                                       // This is also success!
                                       console.info("Wrote value async! (without result)");
                                   }
                               });
                           }
                       }
                   } else {
                       console.error("No device found.");
                       return;
                   }
               });
            } else {
               console.error("Device not found!!");
               /*
               console.info(result.first());
               console.info(' has current? ' + result.first().hasCurrent);
               console.info(result.first().__proto__);
               */

            }
        }
    });

} else {
    console.error("This file should only be loaded on Windows!");
}
};

