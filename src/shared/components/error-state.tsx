'use client';

import { FC } from 'react';

import { Button, ButtonVariant } from './button';
import { Card, CardPadding, CardVariant } from './card';
import './styles/error-state.css';

type Props = {
  title: string;
  onRetry?: () => void;
};

export const ErrorState: FC<Props> = ({ title, onRetry }) => {
  return (
    <Card variant={CardVariant.OUTLINED} padding={CardPadding.MD}>
      <p className="error-state__message">{title}</p>
      {onRetry && (
        <div className="error-state__retry">
          <Button variant={ButtonVariant.SECONDARY} onClick={onRetry}>
            Повторить
          </Button>
        </div>
      )}
    </Card>
  );
};
