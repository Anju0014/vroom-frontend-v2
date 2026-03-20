interface ButtonProps {
    label: string;
    disabled?: boolean;
  }
  
  const Button: React.FC<ButtonProps> = ({ label, disabled }) => {
    return (
      <button className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-400" type="submit" disabled={disabled}>
        {label}
      </button>
    );
  };
  
  export default Button;
  