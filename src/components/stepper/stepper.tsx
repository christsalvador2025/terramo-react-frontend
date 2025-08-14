import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Stepper from "@mui/material/Stepper";
import * as React from "react";

const steps = [
  "Auswahl SH",
  "Auswahl für IRO-Bewertung",
  "IRO-Bewertung",
  "Berichterstattung",
];

interface HorizontalNonLinearStepperProps {
  children: (step: number) => React.ReactNode;
}

export default function HorizontalNonLinearStepper(props: HorizontalNonLinearStepperProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = steps.length;
  // probably used for generating report at the end

  //   const totalSteps = () => {
  //     return steps.length;
  //   };

  //   const isLastStep = () => {
  //     return activeStep === totalSteps() - 1;
  //   };

  const handleNext = () => {
    const newActiveStep = activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper nonLinear activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepButton color="inherit" onClick={handleStep(index)}>
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      <div>
        <React.Fragment>
          <Box mt={6}>
            {props.children(activeStep)}
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Zurück
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleNext} sx={{ mr: 1 }} disabled={activeStep === maxSteps - 1}>
              Weiter
            </Button>
          </Box>
        </React.Fragment>
      </div>
    </Box>
  );
}
