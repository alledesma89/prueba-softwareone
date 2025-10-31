import { ApplicationRef } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app';
import { config } from './app.config.server';

export default function bootstrap(): Promise<ApplicationRef> {
  return bootstrapApplication(App, config);
}