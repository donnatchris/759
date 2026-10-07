'use server';

import { executeAction } from '@/features/core';
import {
  sendInvitationService,
  signUpWithInvitationService,
} from './invitation.service';

export async function sendInvitationAction(input: unknown) {
  return executeAction({
    actionName: 'sendInvitationAction',
    service: sendInvitationService,
    input,
  });
}

export async function signUpWithInvitationAction(input: unknown) {
  return executeAction({
    actionName: 'signUpWithInvitationAction',
    service: signUpWithInvitationService,
    input,
  });
}
