import React from 'react';
import { ButtonProps } from './model';
import './style.scss';

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, children, ...rest }) => {
    return (
        <button className={`btn btn-${variant}${className ? ` ${className}` : ''}`} {...rest}>
            {children}
        </button>
    );
};

export default Button;
