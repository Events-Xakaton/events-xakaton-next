'use client';

import { FC, ReactNode } from 'react';

import {
  Card,
  CardDescription,
  CardPadding,
  CardTitle,
  CardVariant,
} from './card';
import './styles/empty-state.css';

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export const EmptyState: FC<Props> = ({ title, description, action }) => {
  return (
    <Card
      variant={CardVariant.OUTLINED}
      padding={CardPadding.LG}
      className="empty-state"
    >
      <CardTitle as="h3" className="text-lg text-neutral-200">
        {title}
      </CardTitle>
      {description && (
        <CardDescription className="mt-2">{description}</CardDescription>
      )}
      {action && <div className="empty-state__action">{action}</div>}
    </Card>
  );
};
