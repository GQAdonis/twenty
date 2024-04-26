import styled from '@emotion/styled';

import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { RecordChip } from '@/object-record/components/RecordChip';
import {
  ExpandableList,
  ExpandableListProps,
} from '@/object-record/record-field/meta-types/display/components/ExpandableList.tsx';

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const ActivityTargetChips = ({
  activityTargetObjectRecords,
  isHovered,
  reference,
}: {
  activityTargetObjectRecords: ActivityTargetWithTargetRecord[];
} & ExpandableListProps) => {
  return (
    <StyledContainer>
      <ExpandableList isHovered={isHovered} reference={reference}>
        {activityTargetObjectRecords.map((activityTargetObjectRecord) => (
          <RecordChip
            key={activityTargetObjectRecord.targetObject.id}
            record={activityTargetObjectRecord.targetObject}
            objectNameSingular={
              activityTargetObjectRecord.targetObjectMetadataItem.nameSingular
            }
          />
        ))}
      </ExpandableList>
    </StyledContainer>
  );
};
