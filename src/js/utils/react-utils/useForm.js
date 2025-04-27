import { useState, useCallback } from 'react';
import RegexHelper from '../regexHelper';
import { validateField, validateValues } from '../validationHelper';

const useForm = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback((fieldName, value) => validateField(fieldName, value, validationRules, RegexHelper), [validationRules]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    const error = validate(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const isValid = useCallback(() => {
    const { isValid } = validateValues(values, validationRules, RegexHelper);
    return isValid;
  }, [values, validationRules]);

  const setFormValues = useCallback((newValues) => {
    setValues((prev) => ({ ...prev, ...newValues }));

    Object.entries(newValues).forEach(([fieldName, value]) => {
      const error = validate(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    });
  }, [validate]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isValid,
    setFormValues,
  };
};

export default useForm;
