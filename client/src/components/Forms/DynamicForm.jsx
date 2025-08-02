import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import LoadingSpinner from "../UI/LoadingSpinner";

const DynamicForm = ({
  schema,
  onSubmit,
  isSubmitting,
  submitButtonText = "Submit",
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize form data with default values when schema changes
  useEffect(() => {
    if (schema?.properties) {
      const defaultData = {};
      Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
        if (fieldSchema.default !== undefined) {
          defaultData[fieldName] = fieldSchema.default;
        }
      });
      setFormData(defaultData);
      setErrors({});
    } else {
      // If no schema, clear everything
      setFormData({});
      setErrors({});
    }
  }, [schema]);

  const handleInputChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!schema?.properties) return newErrors;

    Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
      const value = formData[fieldName];
      const isRequired = schema.required?.includes(fieldName);

      if (isRequired && (!value || value.toString().trim() === "")) {
        newErrors[fieldName] = "This field is required";
      }

      // Type validation
      if (value && fieldSchema.type) {
        switch (fieldSchema.type) {
          case "number":
          case "integer":
            if (isNaN(value)) {
              newErrors[fieldName] = "Must be a valid number";
            }
            break;
          case "boolean":
            // Boolean validation is handled by checkbox/select
            break;
          case "array":
            if (typeof value === "string") {
              try {
                JSON.parse(value);
              } catch {
                newErrors[fieldName] = "Must be valid JSON array";
              }
            }
            break;
          case "object":
            if (typeof value === "string") {
              try {
                JSON.parse(value);
              } catch {
                newErrors[fieldName] = "Must be valid JSON object";
              }
            }
            break;
        }
      }
    });

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Process form data based on field types
    const processedData = {};

    if (schema?.properties) {
      Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
        const value = formData[fieldName];

        if (value !== undefined && value !== "") {
          switch (fieldSchema.type) {
            case "number":
            case "integer":
              processedData[fieldName] = Number(value);
              break;
            case "boolean":
              processedData[fieldName] = Boolean(value);
              break;
            case "array":
            case "object":
              if (typeof value === "string") {
                try {
                  processedData[fieldName] = JSON.parse(value);
                } catch {
                  processedData[fieldName] = value;
                }
              } else {
                processedData[fieldName] = value;
              }
              break;
            default:
              processedData[fieldName] = value;
          }
        }
      });
    }

    onSubmit(processedData);
  };

  const renderField = (fieldName, fieldSchema) => {
    const value =
      formData[fieldName] !== undefined
        ? formData[fieldName]
        : fieldSchema.default || "";

    const error = errors[fieldName];
    const isRequired = schema.required?.includes(fieldName);

    const baseInputProps = {
      id: fieldName,
      name: fieldName,
      required: isRequired,
      disabled: isSubmitting,
      className: `input-field ${error ? "border-red-500" : ""}`,
    };

    let inputElement;

    switch (fieldSchema.type) {
      case "boolean":
        inputElement = (
          <select
            {...baseInputProps}
            value={value.toString()}
            onChange={(e) =>
              handleInputChange(fieldName, e.target.value === "true")
            }
          >
            <option value="">Select...</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
        break;

      case "number":
      case "integer":
        inputElement = (
          <input
            {...baseInputProps}
            type="number"
            step={fieldSchema.type === "integer" ? "1" : "any"}
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={fieldSchema.example || `Enter ${fieldName}`}
          />
        );
        break;

      case "array":
        // Special handling for startUrls
        if (fieldName === "startUrls") {
          inputElement = (
            <textarea
              {...baseInputProps}
              rows={4}
              value={
                typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : value || ""
              }
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={`[
  {"url": "https://example.com"},
  {"url": "https://another-site.com"}
]`}
            />
          );
        } else {
          inputElement = (
            <textarea
              {...baseInputProps}
              rows={4}
              value={
                typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : value
              }
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={
                fieldSchema.example
                  ? JSON.stringify(fieldSchema.example, null, 2)
                  : `Enter valid JSON ${fieldSchema.type}`
              }
            />
          );
        }
        break;

      case "object":
        inputElement = (
          <textarea
            {...baseInputProps}
            rows={4}
            value={
              typeof value === "object" ? JSON.stringify(value, null, 2) : value
            }
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={
              fieldSchema.example
                ? JSON.stringify(fieldSchema.example, null, 2)
                : `Enter valid JSON ${fieldSchema.type}`
            }
          />
        );
        break;

      default:
        if (fieldSchema.enum) {
          inputElement = (
            <select
              {...baseInputProps}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
            >
              <option value="">Select...</option>
              {fieldSchema.enum.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        } else if (
          fieldSchema.editor === "javascript" ||
          fieldName === "pageFunction"
        ) {
          // Special handling for code fields
          inputElement = (
            <textarea
              {...baseInputProps}
              rows={12}
              value={value || ""}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={fieldSchema.example || `Enter ${fieldName}`}
              className={`${baseInputProps.className} font-mono text-sm`}
              style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
            />
          );
        } else {
          inputElement = (
            <input
              {...baseInputProps}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={fieldSchema.example || `Enter ${fieldName}`}
            />
          );
        }
    }

    return (
      <div key={fieldName} className="space-y-2">
        <label
          htmlFor={fieldName}
          className="block text-sm font-medium text-gray-700"
        >
          {fieldSchema.title || fieldName}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        {inputElement}
        {fieldSchema.description && (
          <p className="text-xs text-gray-500">{fieldSchema.description}</p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  };

  if (!schema) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No schema available</p>
      </div>
    );
  }

  const hasFields =
    schema.properties && Object.keys(schema.properties).length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hasFields ? (
        <div className="space-y-4">
          {Object.entries(schema.properties).map(([fieldName, fieldSchema]) =>
            renderField(fieldName, fieldSchema)
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500 mb-4">
            This actor doesn't require any input parameters.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" />
            <span>{submitButtonText}</span>
          </>
        ) : (
          <>
            <Play size={20} />
            <span>{submitButtonText}</span>
          </>
        )}
      </button>
    </form>
  );
};

export default DynamicForm;
