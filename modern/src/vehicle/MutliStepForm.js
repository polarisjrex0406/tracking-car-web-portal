import React, { useState } from "react";
import VinStep from "./VinStep";
import ConfirmVinModal from "./ConfirmVinModal";
import AdditionalInputsStep from "./AdditionalInputStep";
import VehicleInfo from "./VehicleInfo";

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [vin, setVin] = useState("");
  const [isVinModalOpen, setIsVinModalOpen] = useState(false);
  const [deviceAdditionalInfo, setDeviceAdditionalInfo] = useState(null);
  const [devicePicture, setDevicePicture] = useState(null);

  const handleVinSubmit = (enteredVin) => {
    setVin(enteredVin);
    setIsVinModalOpen(true);
  };
  const handleDeviceInfoSubmit = (deviceDetail) => {
    setDeviceAdditionalInfo(deviceDetail);
    setStep(step + 1);
  };

  const handleVinConfirmation = () => {
    setIsVinModalOpen(false);
    setStep(step + 1);
  };

  const handleDeviceImage = async (image) => {
    if (image.length > 0) {
      setDevicePicture(image);
    }
  };

  return (
    <div>
      {step === 1 && <VinStep onSubmit={handleVinSubmit} />}
      {isVinModalOpen && (
        <ConfirmVinModal
          vin={vin}
          onConfirmation={handleVinConfirmation}
          onCancel={() => setIsVinModalOpen(false)}
        />
      )}
      {step === 2 && (
        <VehicleInfo
          onSubmit={handleDeviceInfoSubmit}
          deviceImage={handleDeviceImage}
        />
      )}
      {step === 3 && (
        <AdditionalInputsStep
          vin={vin}
          deviceAdditionalInfo={deviceAdditionalInfo}
          deviceImage={devicePicture}
        />
      )}
    </div>
  );
};

export default MultiStepForm;
