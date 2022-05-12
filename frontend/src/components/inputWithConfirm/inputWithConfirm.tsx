import { useState } from 'react';

type Props = {
    placeholder: string;
    confirm: string;
    id?: string;
    hotkey?: string;
    clearOnConfirm?: boolean;
    onConfirm?: (value: string) => void;
    onChanged?: (value: string) => void;
};

export function InputWithConfirm(props: Props) {
    const [value, setValue] = useState('');

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.currentTarget.value);
        if (props.onChanged) {
            props.onChanged(e.currentTarget.value);
        }
    };

    const onClick = () => {
        if (props.onConfirm) {
            props.onConfirm(value);
        }
        if (props.clearOnConfirm) {
            setValue('');
        }
    };

    return (
        <div id={props.id}>
            <input
                id={`${props.id}-input`}
                type="text"
                placeholder={props.placeholder}
                onChange={onChange}
                value={value}
            />
            <button id={`${props.id}-button`} onClick={onClick}>
                {props.confirm}
            </button>
        </div>
    );
}
