import React from "react";
import { AnimationWrapper } from "./animation-wrapper.component";

interface Patient {
  name: string;
  temperature: number;
  bloodPressureH: number;
  bloodPressureL: number;
}

export const MyForm = () => {
  const [patient, setPatient] = React.useState<Patient>({
    name: "",
    temperature: 0,
    bloodPressureH: 0,
    bloodPressureL: 0,
  });

  const [feverFlag, setFeverFlag] = React.useState(false);

  React.useEffect(() => {
    setFeverFlag(patient.temperature > 38.9);
  }, [patient.temperature]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatient({ ...patient, [name]: value });
  };

  return (
    <form>
      <label>
        Nombre:
        <input
          type="text"
          name="name"
          value={patient.name}
          onChange={handleChange}
        />
      </label>
      <AnimationWrapper
        inProp={feverFlag}
        render={(animationInProgress) => (
          <label>
            Temperatura:
            <input
              type="number"
              name="temperature"
              value={patient.temperature}
              onChange={handleChange}
              style={{ background: feverFlag ? "lightCoral" : "white" }}
            />
            {animationInProgress ? "Animation in progress" : "quiet"}
          </label>
        )}
      />
      <label>
        Presión arterial:
        <input
          type="number"
          name="bloodPressureL"
          value={patient.bloodPressureL}
          onChange={handleChange}
        />
        /
        <input
          type="number"
          name="bloodPressureH"
          value={patient.bloodPressureH}
          onChange={handleChange}
        />
      </label>
    </form>
  );
};
