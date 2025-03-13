const LoadingSpinner = ({ size = "w-10 h-10" }: { size?: string }) => 
{
  return (
    <div className={`${size} border-4 border-gray-300 border-t-primary rounded-full animate-spin`}></div>
  );
};

export default LoadingSpinner;
