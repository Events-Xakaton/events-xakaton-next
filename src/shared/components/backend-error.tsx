'use client';

import { RefreshCw, ServerOff } from 'lucide-react';
import type { FC } from 'react';

import { Button, ButtonSize, ButtonVariant } from './button';
import { Card, CardPadding, CardVariant } from './card';
import './styles/backend-error.css';

type Props = {
  onRetry?: () => void;
};

export const BackendError: FC<Props> = ({ onRetry }) => {
  return (
    <div className="backend-error">
      <Card
        variant={CardVariant.ELEVATED}
        padding={CardPadding.LG}
        className="w-full"
      >
        <div className="backend-error__inner">
          <div className="backend-error__icon">
            <ServerOff className="h-8 w-8 text-red-400" aria-hidden="true" />
          </div>

          <h2 className="backend-error__title">Сервер недоступен</h2>

          <p className="backend-error__message">
            Backend не запущен. Выполните в терминале:
          </p>

          <div className="backend-error__code-block">
            <code className="text-sm text-accent-400">npm start</code>
          </div>

          <p className="backend-error__hint">
            Или используйте: ./scripts/quick-start.sh
          </p>

          {onRetry && (
            <div className="backend-error__action">
              <Button
                variant={ButtonVariant.PRIMARY}
                size={ButtonSize.LG}
                fullWidth
                onClick={onRetry}
                className="rounded-lg"
              >
                <RefreshCw className="mr-2 h-5 w-5" aria-hidden="true" />
                Повторить
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
