# ai-service/utils/grouping.py

def group_timestamps(matches, gap_threshold=5):
    """
    Groups nearby matching timestamps into continuous segments.
    """
    if not matches:
        return []

    # Sort matches by timestamp just in case
    matches = sorted(matches, key=lambda x: x['timestamp'])
    
    grouped = []
    current_group = {
        'start': matches[0]['timestamp'],
        'end': matches[0]['timestamp'],
        'scores': [matches[0]['score']]
    }

    for match in matches[1:]:
        # If the gap is small, extend the current group
        if match['timestamp'] - current_group['end'] <= gap_threshold:
            current_group['end'] = match['timestamp']
            current_group['scores'].append(match['score'])
        else:
            # Otherwise, save the current group and start a new one
            current_group['score'] = round(max(current_group['scores']), 2)
            grouped.append({
                'start': current_group['start'],
                'end': current_group['end'],
                'score': current_group['score']
            })
            current_group = {
                'start': match['timestamp'],
                'end': match['timestamp'],
                'scores': [match['score']]
            }
            
    # Don't forget to save the last group
    current_group['score'] = round(max(current_group['scores']), 2)
    grouped.append({
        'start': current_group['start'],
        'end': current_group['end'],
        'score': current_group['score']
    })

    return grouped