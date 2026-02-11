
import React from 'react';

interface RiskBadgeProps {
  decision: 'Verified' | 'Suspicious' | 'Bot';
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ decision }) => {
  const styles = {
    Verified: 'bg-green-100 text-green-700 border-green-200',
    Suspicious: 'bg-amber-100 text-amber-700 border-amber-200',
    Bot: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${styles[decision]}`}>
      {decision}
    </span>
  );
};

export default RiskBadge;
