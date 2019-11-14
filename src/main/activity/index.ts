/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

/**
 * For any real-time collaboration application, connected users must have some
 * context about their current collaboration state.  This goes beyond just
 * data synchronization, typically involving communicating user intentions
 * (such as highlighting a sentence before deleting it) and availability
 * (who can I collaborate with?).
 *
 * Great real-time apps go the extra mile to prevent conflicts. That's what
 * this API is all about.
 *
 * @moduledefinition Collaboration Awareness
 */
export * from "./ActivityParticipant";
export * from "./Activity";
export * from "./IActivityJoinOptions";
export * from "./ActivityService";
export * from "./events";