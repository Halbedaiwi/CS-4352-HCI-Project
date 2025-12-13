import React from "react";

const restrictions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Halal',
    'Kosher',
];

interface restrictions{
    chosenRestrictions: string[];
    restrictionChange: (restrictions: string) => void;
}
// label for form control
export const UserRestrictions: React.FC<restrictions> = ({chosenRestrictions, restrictionChange}) => {
return (
    <div className = "flex flex-col space-y-2">
    <h3 className = "text-lg font-medium">Dietary Restrictions</h3>
    <div className = "flex flex-wrap gap-2">
        {restrictions.map((restriction) => (
        <div key = {restriction} className="flex items-center">
            <input
            type="checkbox"
            id = {restriction}
            name = {restriction}
            onChange = {()=> restrictionChange(restriction)}
            checked ={chosenRestrictions.includes(restriction)}
            className = "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor = {restriction} className = "ml-2 text-sm font-medium text-gray-700">  
            {restriction}
            </label>
            </div>
            ))}
            </div>
            </div>
);
};