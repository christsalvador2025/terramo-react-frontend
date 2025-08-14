import Stepper from "../../../components/stepper/stepper";
import IROAssessment from "./iro-assessment";
import IroAssessmentSelection from "./iro-assessment-selection";
import Reporting from "./reporting";
import StakeholderSelection from "./stakeholder-selection";

const DualEssentiality = () => {
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <StakeholderSelection />;
      case 1:
        return <IroAssessmentSelection />;
      case 2:
        return <IROAssessment />;
      case 3:
        return <Reporting />;
      default:
        return null;
    }
  };

  return (
    <>
      <Stepper>{renderStepContent}</Stepper>
    </>
  );
};

export default DualEssentiality;
